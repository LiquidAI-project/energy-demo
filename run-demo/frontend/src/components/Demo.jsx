import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import backgroundImage from "./../assets/yard.png";
import roadImage from "./../assets/road.png";
import cabinImage from "./../assets/cabin.png";
import houseImage from "./../assets/house.png";
import Freezer from "./visual_components/Freezer";
import WashingMachine from "./visual_components/WashingMachine";
import Orchestrator from "./../assets/orchestrator.png";
import { fetchData } from '../services/apiService';

const PUBLIC_HOST = process.env.PUBLIC_HOST;
const PUBLIC_PORT = process.env.PUBLIC_PORT;

const Demo = () => {

  const orchestratorRef = useRef(null);
  const freezerRef = useRef(null);
  const washingMachineRef = useRef(null);
  const logsQueueRef = useRef([]);
  const healthLogTimerRef = useRef(null);

  const [codeToFreezerObjPos, setCodeToFreezerObjPos] = useState(({ x: 0, y: 0 }));
  const [codeToWashingMachineObjPos, setCodeToWashingMachineObjPos] = useState(({ x: 0, y: 0 }));
  const [isCodeMoveObjsVisible, setIsCodeMoveObjsVisible] = useState(false);

  // This function is used to check the code movement animation. This should be removed after the implementation of the actual code movement
  const sampleClicker = () => {
    // if (freezerRef.current) {
    //   const freezer = freezerRef.current.getBoundingClientRect();
    //   const washingMachine = washingMachineRef.current.getBoundingClientRect();
    //   setCodeToFreezerObjPos({
    //     x: freezer.left + freezer.width / 2,
    //     y: freezer.top + freezer.height / 2,
    //   });
    //   setCodeToWashingMachineObjPos({
    //     x: washingMachine.left + washingMachine.width / 2,
    //     y: washingMachine.top + washingMachine.height / 2,
    //   });
    // }
  }

  // Reset the device storage after 3 minutes of inactivity
  const resetDeviceStorage = () => {
    localStorage.setItem("devices", JSON.stringify([]));
  };

  // Reset the health log timer after 3 minutes
  const resetHealthLogTimer = () => {
    clearTimeout(healthLogTimerRef.current);
    healthLogTimerRef.current = setTimeout(resetDeviceStorage, 3 * 60 * 1000);
  };

  // Collect logs in a queue and process them in batch
  const processLogsQueue = () => {
    const logs = logsQueueRef.current;
    if (logs.length === 0) return;

    const updatedDevices = [];

    logs.forEach(log => {
      if (log.funcName === "thingi_health") {
        if (!updatedDevices.some(device => device.name === log.deviceName)) {
          updatedDevices.push({ name: log.deviceName });
        }
      }
    });

    // Update the local storage with the new devices array if there are updates
    if (updatedDevices.length > 0) {
      localStorage.setItem("devices", JSON.stringify(updatedDevices));
      resetHealthLogTimer();
    }

    // Clear the queue
    logsQueueRef.current = [];
  };

  // Get the devices health at the moment
  const getInitialDeviceHealth = async () => {
    try {
      const currentDate = new Date();

      // Subtract 3 minutes from the current date and time because health check is done every 3 minutes from the orchestrator
      currentDate.setTime(currentDate.getTime() - 3 * 60 * 1000);

      // Convert to ISO 8601 format (e.g., "2024-07-24T13:21:35.776Z")
      const formattedDate = currentDate.toISOString();

      const logs = await fetchData("/device/logs?after=" + formattedDate);

      logs.forEach(log => logsQueueRef.current.push(log));
      setTimeout(processLogsQueue, 500);


    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  useEffect(() => {
    getInitialDeviceHealth();
    resetHealthLogTimer();
  }, []);


  // WebSocket setup to receive new logs
  useEffect(() => {
    const ws = new WebSocket(`${PUBLIC_HOST}:${PUBLIC_PORT}`);

    ws.onopen = () => {
      console.log('Connected to the WebSocket server');
    };

    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      
      // Add new logs to the queue
      logsQueueRef.current.push(newLog);

      // Process the queue after a short delay
      setTimeout(processLogsQueue, 500);
    };

    ws.onclose = () => {
      console.log('Disconnected from the WebSocket server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Added a timout to display the code move animation object as it gives wierd movement of (0,0) position to orchestrator position
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCodeMoveObjsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {

    // Moving object is referred to the animation of code moving interpretation
    const setMovingObjInitialPosition = () => {
      if (orchestratorRef.current) {
        const orchestrator = orchestratorRef.current.getBoundingClientRect();
        const orchestratorX = orchestrator.left + orchestrator.width / 2;
        const orchestratorY = orchestrator.top + orchestrator.height / 2;

        setCodeToFreezerObjPos({ x: orchestratorX, y: orchestratorY });
        setCodeToWashingMachineObjPos({ x: orchestratorX, y: orchestratorY });
      }
    };

    setMovingObjInitialPosition();

    // This logic will draw a line between the orchestrator and the equipment
    const connectOrchestratorToEquipment = (equipmentRef, equipmentName) => {
      if (orchestratorRef.current && equipmentRef.current) {
        const orchestrator = orchestratorRef.current.getBoundingClientRect();
        const equipment = equipmentRef.current.getBoundingClientRect();

        const x1 = orchestrator.left + orchestrator.width / 2;
        const y1 = orchestrator.top + orchestrator.height / 2;
        const x2 = equipment.left + equipment.width / 2;
        const y2 = equipment.top + equipment.height / 2;

        const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        const lineStyle = {
          position: 'absolute',
          top: `${y1}px`,
          left: `${x1}px`,
          width: `${length}px`,
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 0',
          borderTop: '2px dashed red',
          zIndex: 1,
        };

        const lineElement = document.getElementById(`orchestrator-${equipmentName}-line`);
        Object.assign(lineElement.style, lineStyle);
      }
    };

    connectOrchestratorToEquipment(freezerRef, "freezer");
    connectOrchestratorToEquipment(washingMachineRef, "washingMachine");
    window.addEventListener('resize', () => connectOrchestratorToEquipment(freezerRef, "freezer"));
    window.addEventListener('resize', () => connectOrchestratorToEquipment(washingMachineRef, "washingMachine"));
    window.addEventListener('resize', setMovingObjInitialPosition);

    return () => {
      window.removeEventListener('resize', () => connectOrchestratorToEquipment(freezerRef, "freezer"));
      window.removeEventListener('resize', () => connectOrchestratorToEquipment(washingMachineRef, "washingMachine"));
      window.removeEventListener('resize', setMovingObjInitialPosition);
    };
  }, []);

  return (
    <div>
      <div
        style={{
          position: "relative",
          top: 20,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            position: "absolute",
            top: "10px",
            left: "22px",
            zIndex: 1,
            fontWeight: "bold",
          }}
        >
          Energy Demo
        </Typography>
        <Grid
          container
          spacing={4}
          columns={5}
          style={{ paddingRight: "3vh", paddingLeft: "3vh" }}
        >
          <div id="orchestrator-freezer-line" />
          <div id="orchestrator-washingMachine-line" />
          {isCodeMoveObjsVisible && (
            <motion.div
              className="round"
              initial={{
                x: codeToFreezerObjPos.x - 25,
                y: codeToFreezerObjPos.y - 25,
              }} // 25 pixels deducted to get the center of the object
              animate={{
                x: codeToFreezerObjPos.x - 25,
                y: codeToFreezerObjPos.y - 25,
              }}
              transition={{ type: "spring", duration: 5 }}
              style={{
                position: "absolute",
                width: "50px",
                height: "50px",
                backgroundColor: "#1E90FF",
                borderRadius: "50%",
                zIndex: 1,
              }}
            />
          )}
          {isCodeMoveObjsVisible && (
            <motion.div
              className="round"
              initial={{
                x: codeToWashingMachineObjPos.x - 25,
                y: codeToWashingMachineObjPos.y - 25,
              }} // 25 pixels deducted to get the center of the object
              animate={{
                x: codeToWashingMachineObjPos.x - 25,
                y: codeToWashingMachineObjPos.y - 25,
              }}
              transition={{ type: "spring", duration: 5 }}
              style={{
                position: "absolute",
                width: "50px",
                height: "50px",
                backgroundColor: "#1E90FF",
                borderRadius: "50%",
                zIndex: 1,
              }}
            />
          )}
          <Grid item xs={12} sm={3} minWidth={"77vh"}>
            <Box>
              <div
                style={{
                  position: "relative",
                  marginTop: "15px",
                  paddingBottom: "83%",
                  width: "100%",
                  height: 0,
                }}
              >
                <img
                  src={backgroundImage}
                  alt="Home yard"
                  className="background-image"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "94.4%",
                    objectFit: "cover",
                    border: "1px solid #DCDCDC",
                    borderRadius: "5px",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                />
                <div
                  className="overlay-content"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <img
                    src={roadImage}
                    alt="Road"
                    className="road-image"
                    style={{
                      position: "absolute",
                      top: "54%",
                      left: "47%",
                      width: "47.5%",
                      height: "40.655%",
                    }}
                  />
                  <img
                    src={cabinImage}
                    alt="Cabin"
                    className="cabin-image"
                    style={{
                      position: "absolute",
                      top: "67%",
                      left: "5%",
                      width: "30%",
                      height: "25%",
                    }}
                  />
                  <img
                    src={houseImage}
                    alt="House"
                    className="house-image"
                    style={{
                      position: "absolute",
                      top: "2%",
                      left: "5%",
                      width: "90%",
                      height: "55%",
                    }}
                  />
                  <div>
                    {/*Energy components inside the house*/}
                    <Freezer ref={freezerRef} />
                    <WashingMachine ref={washingMachineRef} />
                  </div>
                </div>
              </div>
            </Box>
          </Grid>
          <Grid item xs={2} style={{ position: "relative", marginTop: "15px" }}>
            <Grid container spacing={1.5} columns={1}>
              <Grid item xs={1} minWidth="50vh">
                <Box
                  style={{
                    padding: "1vh",
                    border: "1px solid #DCDCDC",
                    borderRadius: "5px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                  height="auto"
                  overflow="hidden"
                >
                  <Box>
                    <div
                      style={{
                        position: "relative",
                        marginTop: "15px",
                        paddingBottom: "83%",
                        width: "100%",
                        height: 0,
                      }}
                    >
                      <div
                        className="overlay-content"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <img
                          src={Orchestrator}
                          alt="Orchestrator"
                          ref={orchestratorRef}
                          style={{
                            position: "absolute",
                            top: "4%",
                            left: "35%",
                            width: "25%",
                            height: "25%",
                            zIndex: 2,
                          }}
                        />
                      </div>
                    </div>
                    <button onClick={sampleClicker}>Click me</button> {/* This button only for develoment testing. should be removed after actual implementation */}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Demo;
