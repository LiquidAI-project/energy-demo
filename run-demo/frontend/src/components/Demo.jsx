import {
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import backgroundImage from "./../assets/yard.png";
import roadImage from "./../assets/road.png";
import cabinImage from "./../assets/cabin.png";
import houseImage from "./../assets/house.png";
import Freezer from "./visual_components/Freezer";
import WashingMachine from "./visual_components/WashingMachine";
import Orchestrator from "./../assets/orchestrator.png";
import WebAssembly_Icon from "./../assets/WebAssembly_Logo.png";
import Query_Icon from "./../assets/query_icon.png";
import Result_Icon from "./../assets/result_icon.png";
import ServiceProvider from "./serviceProvider/ServiceProvider";
import { fetchData, fetchPostData } from '../services/apiService';

// eslint-disable-next-line no-undef
const PUBLIC_HOST = process.env.PUBLIC_HOST;
// eslint-disable-next-line no-undef
const PUBLIC_PORT = process.env.PUBLIC_PORT;
// eslint-disable-next-line no-undef
const DEVICE_CHECK_INTERVAL = process.env.DEVICE_CHECK_INTERVAL;

const Demo = () => {

  const orchestratorRef = useRef(null);
  const serviceProviderRef = useRef(null);
  const freezerRef = useRef(null);
  const washingMachineRef = useRef(null);
  const logsQueueRef = useRef([]);
  const healthLogTimerRef = useRef(null);

  const [movingDeployments, setMovingDeployments] = useState([]);
  const [activeDeployments, setActiveDeployments] = useState([]);

  // Store reference for each devices if needs to get the device location in UI
  const deviceReferences = useMemo(() => ({
    "freezer": freezerRef,
    "washing-machine": washingMachineRef,
    "orchestrator": orchestratorRef,
    "service-provider": serviceProviderRef,
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

  // Object moving one place to another place animation
  const moveCodeAnimation = useCallback((startDeviceName, endDeviceName, iconName) => {
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
              iconName: iconName,
            },
          ];
  
          setTimeout(() => {
            setMovingDeployments((currentMovingDeployments) =>
              currentMovingDeployments.filter(dep => dep.id !== newMovingDeployments[newMovingDeployments.length - 1].id)
            );
            resolve(); // Resolve the promise after the setTimeout is complete
          }, 5000); // Remove after 5 seconds
  
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
  const queryAnimation = async (devicesWithDeployment) => {

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    await moveCodeAnimation("service-provider", "orchestrator", Query_Icon);
    await delay(100);

    // Prepare an array of moveCodeAnimation promises for devices with valid deploymentId
    const moveToDevicesPromises = devicesWithDeployment.map((device) =>
      moveCodeAnimation("orchestrator", device.name, Query_Icon)
    );

    await Promise.all(moveToDevicesPromises);
    await delay(100);

    // Prepare an array of moveCodeAnimation promises for responses from valid devices
    const moveFromDevicesPromises = devicesWithDeployment.map((device) =>
      moveCodeAnimation(device.name, "orchestrator", Result_Icon)
    );

    // Execute moveCodeAnimation from valid devices in parallel
    await Promise.all(moveFromDevicesPromises);
    await delay(100);

    await moveCodeAnimation("orchestrator", "service-provider", Result_Icon);
    await delay(100);
  };


  // Query the devices for energy usage
  const handleQueryClick = async (timeDuration) => {

    let existingDevices = JSON.parse(localStorage.getItem("devices")) || [];
    const devicesWithDeployment = existingDevices.filter(
      (device) => device.deploymentId
    );

    try {

      await queryAnimation(devicesWithDeployment);

      const timeDurationInSeconds = timeDuration * 3600;
      const startTime = new Date().getTime();

      // Prepare an array of API call promises for each device with valid deploymentId
      const apiCalls = devicesWithDeployment.map((device) => {
        const endpoint = `/execute/${device.deploymentId}`;
        const postData = {
          param0: startTime,
          param1: timeDurationInSeconds,
        };
        return fetchPostData(endpoint, postData);
      });

      // Execute all API calls in parallel and wait for their completion
      const responses = await Promise.all(apiCalls);

      // Create a map of device names to the first item of their respective responses
      const responseMap = devicesWithDeployment.reduce((acc, device, index) => {
        acc[device.name] = parseFloat(responses[index][0]);
        return acc;
      }, {});

      return responseMap;
    } catch (error) {
      console.error("Error deploying module:", error);
      return {};
    }
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
        await moveCodeAnimation("orchestrator", log.deviceName, WebAssembly_Icon);
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

    drawLines(orchestratorRef, "orchestrator", freezerRef, "freezer");
    drawLines(orchestratorRef, "orchestrator", washingMachineRef, "washingMachine");
    drawLines(orchestratorRef, "orchestrator", serviceProviderRef, "serviceProvider");
    window.addEventListener('resize', () => drawLines(orchestratorRef, "orchestrator", freezerRef, "freezer"));
    window.addEventListener('resize', () => drawLines(orchestratorRef, "orchestrator", washingMachineRef, "washingMachine"));
    window.addEventListener('resize', () => drawLines(orchestratorRef, "orchestrator", serviceProviderRef, "serviceProvider"));

    return () => {
      window.removeEventListener('resize', () => drawLines(orchestratorRef, "orchestrator", freezerRef, "freezer"));
      window.removeEventListener('resize', () => drawLines(orchestratorRef, "orchestrator", washingMachineRef, "washingMachine"));
      window.addEventListener('resize', () => drawLines(orchestratorRef, "orchestrator", serviceProviderRef, "serviceProvider"));
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
          <div id="orchestrator-serviceProvider-line" />
          {movingDeployments.map((deployment) => (
            <motion.div
              key={deployment.id}
              initial={{
                x: deployment.startPos.x - 25,
                y: deployment.startPos.y - 25,
              }} // Center the animation object
              animate={{
                x: deployment.endPos.x - 25,
                y: deployment.endPos.y - 25,
              }}
              transition={{ type: "spring", duration: 5 }}
              style={{
                position: "absolute",
                zIndex: 1,
              }}
            >
              <img
                src={deployment.iconName}
                alt="Moving object"
                style={{
                  width: "50px",
                  height: "50px",
                }}
              />
            </motion.div>
          ))}
          {activeDeployments.map((deployment) => (
            <motion.div
              key={deployment.id}
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
                        paddingBottom: "26%",
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
                            height: "80%",
                            zIndex: 2,
                          }}
                        />
                      </div>
                    </div>
                  </Box>
                  <ServiceProvider ref={serviceProviderRef} onClick={handleQueryClick} />
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
