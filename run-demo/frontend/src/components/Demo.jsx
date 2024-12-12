// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import backgroundImage from "./../assets/yard.png";
import controlHub from "./../assets/controlHub.png";
import Service_Provider from "./../assets/service_provider.png";
import houseImage from "./../assets/house.png";
import House_Warning_Border from "./../assets/house_warning_border.png";
import Freezer from "./visual_components/Freezer";
import WashingMachine from "./visual_components/WashingMachine";
import MovingIcon from "./visual_components/MovingIcon";
import ElectricCar1 from "./visual_components/ElectricCar1";
import ElectricCar2 from "./visual_components/ElectricCar2";
import Jacuzzi from "./visual_components/Jacuzzi";
import Orchestrator from "./../assets/orchestrator.png";
import WebAssembly_Icon from "./../assets/WebAssembly_Logo.png";
import Query_Icon from "./../assets/query_icon.png";
import Result_Icon_Blue from "./../assets/result_icon.png";
import Result_Icon_Red from "./../assets/result_icon_with_warning.png";
import roadImage from "./../assets/road.png";
import IntelligentControlIcon from "./../assets/intelligent_control.jpg";
import ServiceProvider from "./serviceProvider/ServiceProvider";
import ElectricityPrice from "./serviceProvider/energyQuery/ElectricityConsumption";
import UserControlUI from "./UserControlUI";
import { fetchData } from '../services/apiService';
import DemoControlls from "./DemoControlls";
import DemoDataVisualize from "./DemoDataVisualize";
import { ORCHESTRATOR, FREEZER, WASHING_MACHINE, SERVICE_PROVIDER, INTELLIGENT_CONTROL } from "../../constants";

// eslint-disable-next-line no-undef
const PUBLIC_HOST = process.env.PUBLIC_HOST;
// eslint-disable-next-line no-undef
const PUBLIC_PORT = process.env.PUBLIC_PORT;
// eslint-disable-next-line no-undef
const DEVICE_CHECK_INTERVAL = process.env.DEVICE_CHECK_INTERVAL;
// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = process.env.ANIMATION_MOVING_TIME;

const Demo = () => {

  const orchestratorRef = useRef(null);
  const serviceProviderRef = useRef(null);
  const freezerRef = useRef(null);
  const washingMachineRef = useRef(null);
  const electricCar1Ref = useRef(null);
  const jacuzziRef = useRef(null);
  const electricCar2Ref = useRef(null);
  const intelligentControlRef = useRef(null);
  const logsQueueRef = useRef([]);
  const healthLogTimerRef = useRef(null);

  const [movingDeployments, setMovingDeployments] = useState([]);
  const [activeDeployments, setActiveDeployments] = useState([]);
  const [warningBorderVisible, setWarningBorderVisible] = useState(false);
  const [shouldBlink, setShouldBlink] = useState(false);
  const [logs, setLogs] = useState([]);
  const [userRequirements, setUserRequirements] = useState({});
  const [consumptionData, setConsumptionData] = useState([]); 

  // This function will make the house border blink in order to indicate the warning state when data is going outside
  const startBlinking = () => {
    if (shouldBlink) return; // Prevent multiple triggers

    setShouldBlink(true);

    // Toggle visibility every 250ms
    const blinkInterval = setInterval(() => {
      setWarningBorderVisible(prev => !prev);
    }, 250);

    // Stop blinking after 2 seconds
    setTimeout(() => {
      clearInterval(blinkInterval);
      setWarningBorderVisible(false);
      setShouldBlink(false);
    }, 2000);
  };

  // Store reference for each devices if needs to get the device location in UI
  const deviceReferences = useMemo(() => ({
    [FREEZER]: freezerRef,
    [WASHING_MACHINE]: washingMachineRef,
    [ORCHESTRATOR]: orchestratorRef,
    [SERVICE_PROVIDER]: serviceProviderRef,
    [INTELLIGENT_CONTROL]: intelligentControlRef,
    // Add more device names and their references here
  }), []);

  // Get the reference of the device
  const getDeviceReference = useCallback((deviceName) => {
    const deviceRef = deviceReferences[deviceName];
      if (deviceRef) {
        return deviceRef;
      } else {
        console.error(`No reference found for device: ${deviceName}`);
        return null;
      }
  }, [deviceReferences]);

  const addLog = (message) => {
      setLogs((prevLogs) => [...prevLogs, message]);
  };

  // Object moving one place to another place animation
  const moveCodeAnimation = useCallback((startDeviceName, endDeviceName, iconSource, changingIconSource = null) => {
    return new Promise((resolve) => {
      const startDeviceRef = getDeviceReference(startDeviceName);
      const endDeviceRef = getDeviceReference(endDeviceName);
      if (endDeviceRef.current) {
        const startDevice = startDeviceRef.current.getBoundingClientRect();
        const endDevice = endDeviceRef.current.getBoundingClientRect();

        const startPosition = {
          x: startDevice.left + startDevice.width / 2,
          y: startDevice.top + startDevice.height / 2,
        };

        const endPosition = {
          x: endDevice.left + endDevice.width / 2,
          y: endDevice.top + endDevice.height / 2,
        };

        setMovingDeployments((prevDeployments) => {
          const newMovingDeployments = [
            ...prevDeployments,
            {
              id: prevDeployments.length,
              startPos: startPosition,
              endPos: endPosition,
              iconSource: iconSource,
              changingIconSource: changingIconSource, // Optional new icon
            },
          ];

          // Remove the deployment after 5 seconds
          setTimeout(() => {
            setMovingDeployments((currentMovingDeployments) =>
              currentMovingDeployments.filter(
                (dep) => dep.id !== newMovingDeployments[newMovingDeployments.length - 1].id
              )
            );
            resolve(); // Resolve the promise after the setTimeout is complete
          }, ANIMATION_MOVING_TIME);

          return newMovingDeployments;
        });
      } else {
        resolve();
      }
    });
  }, [getDeviceReference]);

  // Reset the device storage after 3 minutes of inactivity
  const resetDeviceStorage = () => {
    const existingDevices = JSON.parse(localStorage.getItem("devices")) || [];
    const now = Date.now();
    const expiryTime = parseInt(DEVICE_CHECK_INTERVAL) + 2000;

    const updatedDevices = existingDevices.filter(device => now - device.lastUpdateTime < expiryTime);

    localStorage.setItem("devices", JSON.stringify(updatedDevices));
  };

  // Reset the health log timer after 3 minutes
  const resetHealthLogTimer = useCallback(() => {
    clearTimeout(healthLogTimerRef.current);
    healthLogTimerRef.current = setTimeout(() => {
      resetDeviceStorage();
      resetHealthLogTimer();
    }, parseInt(DEVICE_CHECK_INTERVAL));
  }, []);

  // Get the device ID map from local storage
  const getDeviceIdMap = useCallback(() => {
    const storedDeviceMap = localStorage.getItem("deviceIdMap");
    if (!storedDeviceMap) {
      return null;
    }
    const deviceArray = JSON.parse(storedDeviceMap);
    return new Map(deviceArray);
  }, []);

  // Get the device ID by name
  const getDeviceIdByName = useCallback((deviceName) => {
    const deviceIdMap = getDeviceIdMap();
    const deviceId = deviceIdMap.get(deviceName);
    return deviceId || null;
  }, [getDeviceIdMap]);

  // Animation for the whole process while querying the devices for energy usage
  const queryAnimation = async () => {

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    await delay(5000);

    let existingDevices = JSON.parse(localStorage.getItem("devices")) || [];
    const devicesWithDeployment = existingDevices.filter(
      (device) => device.deploymentId && device.isModuleActive
    );

    await moveCodeAnimation(SERVICE_PROVIDER, ORCHESTRATOR, Query_Icon);
    await delay(100);

    // Prepare an array of moveCodeAnimation promises for devices with valid deploymentId
    const moveToDevicesPromises = devicesWithDeployment.map((device) =>
      moveCodeAnimation(ORCHESTRATOR, device.name, Query_Icon)
    );

    await Promise.all(moveToDevicesPromises);
    await delay(100);

    // Prepare an array of moveCodeAnimation promises for responses from valid devices
    const moveFromDevicesPromises = devicesWithDeployment.map((device) =>
      moveCodeAnimation(device.name, ORCHESTRATOR, Result_Icon_Blue)
    );

    // Execute moveCodeAnimation from valid devices in parallel
    await Promise.all(moveFromDevicesPromises);
    await delay(100);

    if (devicesWithDeployment.length !== 0) {
        setTimeout(() => {
            startBlinking(); // Start blinking the house border when data going outside the house
        }, 700);
    }

    await moveCodeAnimation(ORCHESTRATOR, SERVICE_PROVIDER, Result_Icon_Blue, Result_Icon_Red);
    await delay(100);
  };
  
  // Update the deployment details for the device
  const updateDeployment = useCallback(async (device, deviceName, deployments) => {

    const deviceSpecificDeployment = deployments.find((item) =>
      item.sequence.some((seq) => seq.device === device.deviceId)
    );

    if (deviceSpecificDeployment) {

      // Accessing the modules inside fullManifest using the deviceId
      const deviceManifest = deviceSpecificDeployment.fullManifest[device.deviceId];

      device.deploymentId = deviceSpecificDeployment._id;
      device.existingModuleId = deviceManifest.modules[0].id;
      device.existingModuleName = deviceManifest.modules[0].name;
      device.isModuleActive = Boolean(deviceSpecificDeployment.active);

      const deviceRef = getDeviceReference(deviceName);

      if (deviceRef.current && device.isModuleActive) {
        const deviceBounds = deviceRef.current.getBoundingClientRect();

        const wasmModuleIconPosition = {
          x: deviceBounds.left + deviceBounds.width / 2,
          y: deviceBounds.top + deviceBounds.height / 2,
        };

        setActiveDeployments((prevActiveDeployments) => {
          const existingDeploymentIds = prevActiveDeployments.map((dep) => dep.id);

          if (!existingDeploymentIds.includes(deviceSpecificDeployment._id)) {
            return [
              ...prevActiveDeployments,
              {
                id: deviceSpecificDeployment._id,
                wasmModuleIconPosition: wasmModuleIconPosition,
                deviceId: device.deviceId,
              },
            ];
          }
          return prevActiveDeployments;
        });
      }

    } else {
      device.deploymentId = null;
      device.existingModuleId = null;
      device.existingModuleName = null;
      device.isModuleActive = false;

      setActiveDeployments((prevActiveDeployments) => {
        return prevActiveDeployments.filter((dep) => dep.deviceId !== device.deviceId);
      });
    }
  }, [getDeviceReference]);

  // Collect logs in a queue and process them in batch
  const processLogsQueue = useCallback(async () => {
    const logs = logsQueueRef.current;
    if (logs.length === 0) return;

    // Get the existing devices from local storage
    let existingDevices = JSON.parse(localStorage.getItem("devices")) || [];

    // Convert the array to a map for efficient updates
    const deviceMap = new Map(existingDevices.map(device => [device.name, device]));

    const now = Date.now();
    const expiryTime = parseInt(DEVICE_CHECK_INTERVAL) + 2000;

    const updatePromises = [];

    const deployments = await fetchData("/file/manifest"); // Fetch all the deployments available in orchestrator

    for (const log of logs) {
      const deviceId = getDeviceIdByName(log.deviceName);
      const logReceivedTime = new Date(log.dateReceived).getTime(); // This is in milliseconds

      if (log.funcName === "thingi_health") {
        if (!deviceMap.has(log.deviceName)) {
          deviceMap.set(log.deviceName, {
            name: log.deviceName,
            lastUpdateTime: now,
            deviceId: deviceId,
            deploymentId: null,
            existingModuleId: null,
            existingModuleName: null,
            isModuleActive: false,
          });
        } else {
          const device = deviceMap.get(log.deviceName);
          device.lastUpdateTime = now;
          device.deviceId = deviceId;

          // This will make sure any changes to deployment are updated in local storage
          updatePromises.push(updateDeployment(deviceMap.get(log.deviceName), log.deviceName, deployments));
        }
        // Added log time and current time difference check to prevent to create multiple moving object for old logs when refreshing the page
      } else if (log.funcName === "deployment_create" && ((now - logReceivedTime) < 5000)) {
        await moveCodeAnimation(ORCHESTRATOR, log.deviceName, WebAssembly_Icon);
        updatePromises.push(updateDeployment(deviceMap.get(log.deviceName), log.deviceName, deployments));
      }
    }

    // Wait for all updateDeployment calls to complete
    await Promise.all(updatePromises);

    // Filter out devices that haven't been updated within the expiry time
    const updatedDevices = Array.from(deviceMap.values()).filter(device => now - device.lastUpdateTime < expiryTime);

    // Update the local storage with the new devices array
    localStorage.setItem("devices", JSON.stringify(updatedDevices));

    // Clear the queue
    logsQueueRef.current = [];
  }, [getDeviceIdByName, moveCodeAnimation, updateDeployment]);

  // Trigger processing when deviceIdMap changes
  useEffect(() => {
    if (getDeviceIdMap.size > 0) {
      processLogsQueue();
    }
  }, [getDeviceIdMap, processLogsQueue]);

  // Get the devices health at the moment
  const getInitialDeviceHealth = useCallback(async () => {
    try {
      const currentDate = new Date();

      // Subtract 3 minutes from the current date and time because health check is done every 3 minutes from the orchestrator
      currentDate.setTime(currentDate.getTime() - parseInt(DEVICE_CHECK_INTERVAL));

      // Convert to ISO 8601 format (e.g., "2024-07-24T13:21:35.776Z")
      const formattedDate = currentDate.toISOString();

      const logs = await fetchData("/device/logs?after=" + formattedDate);

      logs.forEach(log => logsQueueRef.current.push(log));
      setTimeout(processLogsQueue, 500);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [processLogsQueue]);

  // Fetch the device data from the API
  const fetchDeviceData = async () => {
    try {
      const devicesFromAPI = await fetchData("/file/device");
      const deviceMap = new Map(devicesFromAPI.map(device => [device.name, device._id]));
      localStorage.setItem("deviceIdMap", JSON.stringify(Array.from(deviceMap.entries())));
    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  };

  useEffect(() => {
    fetchDeviceData();
    getInitialDeviceHealth();
    resetHealthLogTimer();
  }, [getInitialDeviceHealth, resetHealthLogTimer]);


  // WebSocket setup to receive new logs
  useEffect(() => {
    const wsHost = PUBLIC_HOST.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsHost}:${PUBLIC_PORT}`);

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
  }, [processLogsQueue]);

  useEffect(() => {

    // This logic will draw a line between the orchestrator and the equipment
    const drawLines = (point_A_ref, point_A_name, point_B_ref, point_B_name) => {
      if (point_A_ref.current && point_B_ref.current) {
        const point_A_bounds = point_A_ref.current.getBoundingClientRect();
        const point_B_bounds = point_B_ref.current.getBoundingClientRect();

        const x1 = point_A_bounds.left + point_A_bounds.width / 2;
        const y1 = point_A_bounds.top + point_A_bounds.height / 2;
        const x2 = point_B_bounds.left + point_B_bounds.width / 2;
        const y2 = point_B_bounds.top + point_B_bounds.height / 2;

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

        const lineElement = document.getElementById(`${point_A_name}-${point_B_name}-line`);
        Object.assign(lineElement.style, lineStyle);
      }
    };

    drawLines(orchestratorRef, ORCHESTRATOR, freezerRef, FREEZER);
    drawLines(orchestratorRef, ORCHESTRATOR, washingMachineRef, WASHING_MACHINE);
    drawLines(orchestratorRef, ORCHESTRATOR, serviceProviderRef, SERVICE_PROVIDER);
    drawLines(orchestratorRef, ORCHESTRATOR, intelligentControlRef, INTELLIGENT_CONTROL);
    window.addEventListener('resize', () => drawLines(orchestratorRef, ORCHESTRATOR, freezerRef, FREEZER));
    window.addEventListener('resize', () => drawLines(orchestratorRef, ORCHESTRATOR, washingMachineRef, WASHING_MACHINE));
    window.addEventListener('resize', () => drawLines(orchestratorRef, ORCHESTRATOR, serviceProviderRef, SERVICE_PROVIDER));
    window.addEventListener('resize', () => drawLines(orchestratorRef, ORCHESTRATOR, intelligentControlRef, INTELLIGENT_CONTROL));

    return () => {
      window.removeEventListener('resize', () => drawLines(orchestratorRef, ORCHESTRATOR, freezerRef, FREEZER));
      window.removeEventListener('resize', () => drawLines(orchestratorRef, ORCHESTRATOR, washingMachineRef, WASHING_MACHINE));
      window.removeEventListener('resize', () => drawLines(orchestratorRef, ORCHESTRATOR, serviceProviderRef, SERVICE_PROVIDER));
      window.removeEventListener('resize', () => drawLines(orchestratorRef, ORCHESTRATOR, intelligentControlRef, INTELLIGENT_CONTROL));
    };
  }, []);

/**
 * This function updates the user requirements for a specific piece of equipment in the state.
 * 
 * @param {Object} userRequirement - The new data or requirement to be set for the specified equipment.
 * @param {string} equipment - The key for the equipment whose user requirements are being updated (e.g., 'washingMachine', 'freezer').
 * 
 */
  const handleUserRequirements = (userRequirement, equipment) => {
      setUserRequirements((prevRequirements) => ({
          ...prevRequirements,
          [equipment]: userRequirement,
      }));
  };

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
          <div id="orchestrator-serviceProvider-line" />
          <div id="orchestrator-intelligentControl-line" />
          {movingDeployments.map((deployment, index) => (
            <MovingIcon key={index} deployment={deployment} />
          ))}
          {activeDeployments.map((deployment, index) => (
            <motion.div
              key={index}
              initial={{
                x: deployment.wasmModuleIconPosition.x - 25,
                y: deployment.wasmModuleIconPosition.y - 25,
                width: "50px", // Set initial width
                height: "50px", // Set initial height
              }}
              animate={{
                x: deployment.wasmModuleIconPosition.x - 25,
                y: deployment.wasmModuleIconPosition.y - 25,
                width: "20px", // Animate to smaller width
                height: "20px", // Animate to smaller height
              }}
              transition={{ type: "spring", duration: 5 }}
              style={{
                position: "absolute",
                zIndex: 1,
              }}
            >
              <img
                src={WebAssembly_Icon}
                alt="Moving object"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </motion.div>
          ))}
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
                  id="house_warning_border"
                  src={House_Warning_Border}
                  alt="warning"
                  className="house_warning_border"
                  style={{
                    position: "absolute",
                    left: "-1%",
                    top: "-1%",
                    width: "102%",
                    height: "85.5%",
                    opacity: warningBorderVisible ? 1 : 0,
                    transition: "opacity 0.25s",
                  }}
                />
                <img
                  src={backgroundImage}
                  alt="Home yard"
                  className="background-image"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "83%",
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
                    src={controlHub}
                    alt="controlHub"
                    className="controlHub-image"
                    style={{
                      position: "absolute",
                      top: "54%",
                      left: "17%",
                      width: "77%",
                      height: "10.655%",
                    }}
                  />
                    <img
                        src={roadImage}
                        alt="Road"
                        className="road-image"
                        style={{
                        position: "absolute",
                        top: "54%",
                        left: "47%",
                        width: "47.5%",
                        height: "29.2%",
                    }}
                  />
                  <img
                    src={Orchestrator}
                    alt="Orchestrator"
                    ref={orchestratorRef}
                    style={{
                      position: "absolute",
                      top: "57%",
                      left: "25%",
                      width: "7%",
                      height: "7%",
                      zIndex: 2,
                    }}
                  />
                  <img
                    src={IntelligentControlIcon}
                    alt="IntelligentControl"
                    ref={intelligentControlRef}
                    style={{
                      position: "absolute",
                      top: "57%",
                      left: "45%",
                      width: "6%",
                      height: "7%",
                      zIndex: 2,
                    }}
                  />
                  <img
                    src={Service_Provider}
                    alt="Service_Provider"
                    ref={serviceProviderRef}
                    style={{
                      position: "absolute",
                      top: "90%",
                      left: "21.2%",
                      width: "15%",
                      zIndex: 2,
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
                    <ElectricCar1 ref={electricCar1Ref} />
                    <ElectricCar2 ref={electricCar2Ref} />
                    <Jacuzzi ref={jacuzziRef} />
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
                  <div style={{marginBottom: "5%"}}>
                    <DemoControlls onLogAdd={(log) => addLog(log)} queryingAnimationRun={queryAnimation} userRequirement={userRequirements}/>
                  </div>
                  <DemoDataVisualize logs={logs}/>
                  {/* <ServiceProvider
                    ref={serviceProviderRef}
                    onClick={handleQueryClick}
                  /> */}
                  {/* <ElectricityPrice consumptionData={consumptionData} /> */}
                  <UserControlUI onUserRequirementChange={(userRequirement, equipment) => handleUserRequirements(userRequirement, equipment)}/>
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
