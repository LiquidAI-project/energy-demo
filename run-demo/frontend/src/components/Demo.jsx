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
import Service_Provider1 from "./../assets/service_provider.png";
import Service_Provider2 from "./../assets/service_provider.png";
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
import ConfigurationIcon from "./../assets/configurationIcon.png";
import Query_Icon from "./../assets/query_icon.png";
import EnergyUsageIcon from "./../assets/energy_usage_icon.png";
import Result_Icon_Red from "./../assets/result_icon_with_warning.png";
import roadImage from "./../assets/road.png";
import IntelligentControlIcon from "./../assets/intelligent_control.jpg";
import EVChargerEnergyIcon from "../assets/ev_charger_energy.png";
import EVChargerIcon from "../assets/ev_charger.png";
import Energy_Company_Icon from "../assets/spot_price.png";
import SpotPriceDataIcon from "../assets/spotPriceDataIcon.png";
import TemperatureDataIcon from "../assets/temperature_data_icon.png";
import DangerIcon from "../assets/danger_icon.png";
import userPreferenceIcon from "../assets/user_preference_icon.png";
import ServiceProvider from "./serviceProvider/ServiceProvider";
import ElectricityPrice from "./serviceProvider/energyQuery/ElectricityConsumption";
import UserControlUI from "./userControl/UserControlUI";
import { fetchData } from '../services/apiService';
import DemoControlls from "./demoControll/DemoControlls";
import DemoDataVisualize from "./DemoDataVisualize";
import { getDeviceIdMap, getDeviceIdByName } from "../utils/deviceUtils";
import {
  ORCHESTRATOR,
  FREEZER,
  WASHING_MACHINE,
  SERVICE_PROVIDER1,
  SERVICE_PROVIDER2,
  ENERGY_COMPANY,
  INTELLIGENT_CONTROL,
  USER_CONTROL,
  EV_CHARGER,
  WITHOUT_LIQUID_AI,
  WITH_LIQUID_AI,
} from "../../constants";
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line no-undef
const PUBLIC_HOST = process.env.PUBLIC_HOST;
// eslint-disable-next-line no-undef
const PUBLIC_PORT = process.env.PUBLIC_PORT;
// eslint-disable-next-line no-undef
const DEVICE_CHECK_INTERVAL = process.env.DEVICE_CHECK_INTERVAL;
// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = process.env.ANIMATION_MOVING_TIME;

const DATA_ICONS_MOVING_FROM_WM = [EnergyUsageIcon, userPreferenceIcon];
const DATA_ICONS_MOVING_FROM_FREEZER = [EnergyUsageIcon, userPreferenceIcon, TemperatureDataIcon];
const DATA_ICONS_MOVING_FROM_EV = [EnergyUsageIcon, userPreferenceIcon];

const Demo = () => {
  const orchestratorRef = useRef(null);
  const serviceProviderRef1 = useRef(null);
  const serviceProviderRef2 = useRef(null);
  const freezerRef = useRef(null);
  const washingMachineRef = useRef(null);
  const electricCar1Ref = useRef(null);
  const jacuzziRef = useRef(null);
  const electricCar2Ref = useRef(null);
  const intelligentControlRef = useRef(null);
  const userControlRef = useRef(null);
  const energyCompanyRef = useRef(null);
  const evChargerRef = useRef(null);
  const logsQueueRef = useRef([]);
  const healthLogTimerRef = useRef(null);

  const [movingDeployments, setMovingDeployments] = useState([]);
  const [activeDeployments, setActiveDeployments] = useState([]);
  const [warningBorderVisible, setWarningBorderVisible] = useState(false);
  const [shouldBlink, setShouldBlink] = useState(false);
  const [logs, setLogs] = useState([]);
  const [userRequirements, setUserRequirements] = useState({});
  const [optimizedTimeSlots, setOptimizedTimeSlots] = useState({});
  const [selectedRunMethod, setSelectedRunMethod] = useState(WITHOUT_LIQUID_AI);
  const [consumptionData, setConsumptionData] = useState([]);

  // This function will make the house border blink in order to indicate the warning state when data is going outside
  const startBlinking = () => {
    if (shouldBlink) return; // Prevent multiple triggers

    setShouldBlink(true);

    // Toggle visibility every 250ms
    const blinkInterval = setInterval(() => {
      setWarningBorderVisible((prev) => !prev);
    }, 250);

    // Stop blinking after 2 seconds
    setTimeout(() => {
      clearInterval(blinkInterval);
      setWarningBorderVisible(false);
      setShouldBlink(false);
    }, 2000);
  };

  // Store reference for each devices if needs to get the device location in UI
  const deviceReferences = useMemo(
    () => ({
      [FREEZER]: freezerRef,
      [WASHING_MACHINE]: washingMachineRef,
      [ORCHESTRATOR]: orchestratorRef,
      [SERVICE_PROVIDER1]: serviceProviderRef1,
      [SERVICE_PROVIDER2]: serviceProviderRef2,
      [INTELLIGENT_CONTROL]: intelligentControlRef,
      [USER_CONTROL]: userControlRef,
      [EV_CHARGER]: evChargerRef,
      [ENERGY_COMPANY]: energyCompanyRef,
      // Add more device names and their references here
    }),
    []
  );

  const houseHoldDevices = [FREEZER, WASHING_MACHINE, EV_CHARGER];

  // Get the reference of the device
  const getDeviceReference = useCallback(
    (deviceName) => {
      const deviceRef = deviceReferences[deviceName];
      if (deviceRef) {
        return deviceRef;
      } else {
        console.error(`No reference found for device: ${deviceName}`);
        return null;
      }
    },
    [deviceReferences]
  );

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  // Object moving one place to another place animation
  const moveCodeAnimation = useCallback(
    (startDeviceName, endDeviceName, iconSource, changingIconSource = null) => {
      return new Promise((resolve) => {
        const startDeviceRef = getDeviceReference(startDeviceName);
        const endDeviceRef = getDeviceReference(endDeviceName);
  
        if (endDeviceRef.current && startDeviceRef.current) {
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
  
          // Generate a unique ID using UUID v4
          const uniqueId = uuidv4();
  
          const animationDuration = ANIMATION_MOVING_TIME; // duration of the movement in milliseconds
  
          const newMovingDeployments = {
            id: uniqueId, // Use the UUID as a unique identifier
            startPos: startPosition,
            endPos: endPosition,
            iconSource: iconSource,
            changingIconSource: changingIconSource,
            startTime: Date.now(), // Track start time for the animation
            endTime: Date.now() + animationDuration, // Calculate the end time
          };
  
          setMovingDeployments((prevDeployments) => {
            // Add the new deployment to the state
            const updatedDeployments = [...prevDeployments, newMovingDeployments];
  
            // Set timeout to remove the animation from state after its duration
            setTimeout(() => {
              // Remove the animation once the movement duration ends
              setMovingDeployments((currentDeployments) => 
                currentDeployments.filter(dep => dep.id !== uniqueId)
              );
              resolve(); // Resolve once the animation is complete
            }, animationDuration);
  
            return updatedDeployments;
          });
        } else {
          resolve(); // Resolve immediately if the end device is not found
        }
      });
    },
    [getDeviceReference]
  );

  // Reset the device storage after 3 minutes of inactivity
  const resetDeviceStorage = () => {
    const existingDevices = JSON.parse(localStorage.getItem("devices")) || [];
    const now = Date.now();
    const expiryTime = parseInt(DEVICE_CHECK_INTERVAL) + 2000;

    const updatedDevices = existingDevices.filter(
      (device) => now - device.lastUpdateTime < expiryTime
    );

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

  // Handle animation of icon movements
  const continousAnimationRun = async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (selectedRunMethod === WITH_LIQUID_AI) {
      moveCodeAnimation(ENERGY_COMPANY, INTELLIGENT_CONTROL, SpotPriceDataIcon);
    } else {

        // Randomly pick an icon from each set
        const randomIconsFromWM = DATA_ICONS_MOVING_FROM_WM[Math.floor(Math.random() * DATA_ICONS_MOVING_FROM_WM.length)];
        const randomIconsFromFreezer = DATA_ICONS_MOVING_FROM_FREEZER[Math.floor(Math.random() * DATA_ICONS_MOVING_FROM_FREEZER.length)];
        const randomIconsFromEV = DATA_ICONS_MOVING_FROM_EV[Math.floor(Math.random() * DATA_ICONS_MOVING_FROM_EV.length)];

      // Animation for the whole process while querying the energy data from the devices to external service providers
      const moveFromDevicesPromises = houseHoldDevices.map((device) => {
        if (device === EV_CHARGER) {
          moveCodeAnimation(
            device,
            SERVICE_PROVIDER2,
            randomIconsFromEV,
            DangerIcon
          );
        } 
        if (device === FREEZER) {
          moveCodeAnimation(
            device,
            SERVICE_PROVIDER1,
            randomIconsFromFreezer,
            DangerIcon
          );
        } 
        if (device === WASHING_MACHINE) {
          moveCodeAnimation(
            device,
            SERVICE_PROVIDER1,
            randomIconsFromWM,
            DangerIcon
          );
        }
      });

      await Promise.all(moveFromDevicesPromises);
      await delay(100);

      if (houseHoldDevices.length !== 0) {
        setTimeout(() => {
          startBlinking(); // Start blinking the house border when data going outside the house
        }, 1200);
      }
      await delay(100);
    }
  };

  // Update the deployment details for the device
  const updateDeployment = useCallback(
    async (device, deviceName, deployments) => {
      const deviceSpecificDeployment = deployments.find((item) =>
        item.sequence.some((seq) => seq.device === device.deviceId)
      );

      if (deviceSpecificDeployment) {
        // Accessing the modules inside fullManifest using the deviceId
        const deviceManifest =
          deviceSpecificDeployment.fullManifest[device.deviceId];

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
            const existingDeploymentIds = prevActiveDeployments.map(
              (dep) => dep.id
            );

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
          return prevActiveDeployments.filter(
            (dep) => dep.deviceId !== device.deviceId
          );
        });
      }
    },
    [getDeviceReference]
  );

  // Collect logs in a queue and process them in batch
  const processLogsQueue = useCallback(async () => {
    const logs = logsQueueRef.current;
    if (logs.length === 0) return;

    // Get the existing devices from local storage
    let existingDevices = JSON.parse(localStorage.getItem("devices")) || [];

    // Convert the array to a map for efficient updates
    const deviceMap = new Map(
      existingDevices.map((device) => [device.name, device])
    );

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
          updatePromises.push(
            updateDeployment(
              deviceMap.get(log.deviceName),
              log.deviceName,
              deployments
            )
          );
        }
        // Added log time and current time difference check to prevent to create multiple moving object for old logs when refreshing the page
      } else if (
        log.funcName === "deployment_create" &&
        now - logReceivedTime < 5000
      ) {
        await moveCodeAnimation(ORCHESTRATOR, log.deviceName, WebAssembly_Icon);
        updatePromises.push(
          updateDeployment(
            deviceMap.get(log.deviceName),
            log.deviceName,
            deployments
          )
        );
      }
    }

    // Wait for all updateDeployment calls to complete
    await Promise.all(updatePromises);

    // Filter out devices that haven't been updated within the expiry time
    const updatedDevices = Array.from(deviceMap.values()).filter(
      (device) => now - device.lastUpdateTime < expiryTime
    );

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
      currentDate.setTime(
        currentDate.getTime() - parseInt(DEVICE_CHECK_INTERVAL)
      );

      // Convert to ISO 8601 format (e.g., "2024-07-24T13:21:35.776Z")
      const formattedDate = currentDate.toISOString();

      const logs = await fetchData("/device/logs?after=" + formattedDate);

      logs.forEach((log) => logsQueueRef.current.push(log));
      setTimeout(processLogsQueue, 500);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [processLogsQueue]);

  // Fetch the device data from the API
  const fetchDeviceData = async () => {
    try {
      const devicesFromAPI = await fetchData("/file/device");
      const deviceMap = new Map(
        devicesFromAPI.map((device) => [device.name, device._id])
      );
      localStorage.setItem(
        "deviceIdMap",
        JSON.stringify(Array.from(deviceMap.entries()))
      );
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };

  useEffect(() => {
    fetchDeviceData();
    getInitialDeviceHealth();
    resetHealthLogTimer();
  }, [getInitialDeviceHealth, resetHealthLogTimer]);

  // WebSocket setup to receive new logs
  useEffect(() => {
    const wsHost = PUBLIC_HOST.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsHost}:${PUBLIC_PORT}`);

    ws.onopen = () => {
      console.log("Connected to the WebSocket server");
    };

    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);

      // Add new logs to the queue
      logsQueueRef.current.push(newLog);

      // Process the queue after a short delay
      setTimeout(processLogsQueue, 500);
    };

    ws.onclose = () => {
      console.log("Disconnected from the WebSocket server");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [processLogsQueue]);

  useEffect(() => {
    // This logic will draw a line between the orchestrator and the equipment
    const drawLines = (
      point_A_ref,
      point_A_name,
      point_B_ref,
      point_B_name
    ) => {
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
          position: "absolute",
          top: `${y1}px`,
          left: `${x1}px`,
          width: `${length}px`,
          transform: `rotate(${angle}deg)`,
          transformOrigin: "0 0",
          borderTop: "2px dashed red",
          zIndex: 1,
        };

        const lineElement = document.getElementById(
          `${point_A_name}-${point_B_name}-line`
        );
        Object.assign(lineElement.style, lineStyle);
      }
    };

    if (selectedRunMethod === WITH_LIQUID_AI) {
      drawLines(
        orchestratorRef,
        ORCHESTRATOR,
        intelligentControlRef,
        INTELLIGENT_CONTROL
      );
      drawLines(
        userControlRef,
        USER_CONTROL,
        intelligentControlRef,
        INTELLIGENT_CONTROL
      );
      drawLines(orchestratorRef, ORCHESTRATOR, freezerRef, FREEZER);
      drawLines(
        orchestratorRef,
        ORCHESTRATOR,
        washingMachineRef,
        WASHING_MACHINE
      );
      drawLines(
        orchestratorRef,
        ORCHESTRATOR,
        serviceProviderRef1,
        SERVICE_PROVIDER1
      );
      drawLines(orchestratorRef, ORCHESTRATOR, evChargerRef, EV_CHARGER);
      drawLines(
        energyCompanyRef,
        ENERGY_COMPANY,
        intelligentControlRef,
        INTELLIGENT_CONTROL
      );

      window.addEventListener("resize", () =>
        drawLines(
          orchestratorRef,
          ORCHESTRATOR,
          intelligentControlRef,
          INTELLIGENT_CONTROL
        )
      );
      window.addEventListener("resize", () =>
        drawLines(
          userControlRef,
          USER_CONTROL,
          intelligentControlRef,
          INTELLIGENT_CONTROL
        )
      );
      window.addEventListener("resize", () =>
        drawLines(orchestratorRef, ORCHESTRATOR, freezerRef, FREEZER)
      );
      window.addEventListener("resize", () =>
        drawLines(
          orchestratorRef,
          ORCHESTRATOR,
          washingMachineRef,
          WASHING_MACHINE
        )
      );
      window.addEventListener("resize", () =>
        drawLines(
          orchestratorRef,
          ORCHESTRATOR,
          serviceProviderRef1,
          SERVICE_PROVIDER1
        )
      );
      window.addEventListener("resize", () =>
        drawLines(orchestratorRef, ORCHESTRATOR, evChargerRef, EV_CHARGER)
      );
      window.addEventListener("resize", () =>
        drawLines(
          energyCompanyRef,
          ENERGY_COMPANY,
          intelligentControlRef,
          INTELLIGENT_CONTROL
        )
      );
    } else {
      drawLines(serviceProviderRef1, SERVICE_PROVIDER1, freezerRef, FREEZER);
      drawLines(
        serviceProviderRef1,
        SERVICE_PROVIDER1,
        washingMachineRef,
        WASHING_MACHINE
      );
      drawLines(
        serviceProviderRef2,
        SERVICE_PROVIDER2,
        evChargerRef,
        EV_CHARGER
      );

      window.addEventListener("resize", () =>
        drawLines(serviceProviderRef1, SERVICE_PROVIDER1, freezerRef, FREEZER)
      );
      window.addEventListener("resize", () =>
        drawLines(
          serviceProviderRef1,
          SERVICE_PROVIDER1,
          washingMachineRef,
          WASHING_MACHINE
        )
      );
      window.addEventListener("resize", () =>
        drawLines(
          serviceProviderRef2,
          SERVICE_PROVIDER2,
          evChargerRef,
          EV_CHARGER
        )
      );
    }

    return () => {
      if (selectedRunMethod === WITH_LIQUID_AI) {
        window.removeEventListener("resize", () =>
          drawLines(
            orchestratorRef,
            ORCHESTRATOR,
            intelligentControlRef,
            INTELLIGENT_CONTROL
          )
        );
        window.removeEventListener("resize", () =>
          drawLines(
            userControlRef,
            USER_CONTROL,
            intelligentControlRef,
            INTELLIGENT_CONTROL
          )
        );
        window.removeEventListener("resize", () =>
          drawLines(orchestratorRef, ORCHESTRATOR, freezerRef, FREEZER)
        );
        window.removeEventListener("resize", () =>
          drawLines(
            orchestratorRef,
            ORCHESTRATOR,
            washingMachineRef,
            WASHING_MACHINE
          )
        );
        window.removeEventListener("resize", () =>
          drawLines(
            orchestratorRef,
            ORCHESTRATOR,
            serviceProviderRef1,
            SERVICE_PROVIDER1
          )
        );
        window.removeEventListener("resize", () =>
          drawLines(orchestratorRef, ORCHESTRATOR, evChargerRef, EV_CHARGER)
        );
        window.removeEventListener("resize", () =>
          drawLines(
            energyCompanyRef,
            ENERGY_COMPANY,
            intelligentControlRef,
            INTELLIGENT_CONTROL
          )
        );
      } else {
        window.removeEventListener("resize", () =>
          drawLines(
            serviceProviderRef1,
            SERVICE_PROVIDER1,
            washingMachineRef,
            WASHING_MACHINE
          )
        );
        window.removeEventListener("resize", () =>
          drawLines(serviceProviderRef1, SERVICE_PROVIDER1, freezerRef, FREEZER)
        );
        window.removeEventListener("resize", () =>
          drawLines(
            serviceProviderRef2,
            SERVICE_PROVIDER2,
            evChargerRef,
            EV_CHARGER
          )
        );
      }
    };
  }, [selectedRunMethod]);

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

  /**
   * This function updates the optimal time of an equipment to operate.
   *
   * @param {Object} optimizedTimeSlots - The new optimized data to be set for the specified equipment.
   * @param {string} equipment - The key for the equipment whose user requirements are being updated (e.g., 'washingMachine', 'freezer').
   *
   */
  const handleOptimizedTimeSlots = (optimizedTimeSlots, equipment) => {
    setOptimizedTimeSlots({
      [equipment]: optimizedTimeSlots,
    });
  };

  /**
   * This function updates the demo running method
   *
   * @param {String} method - Running method selected by the user. With or without liquid AI.
   *
   */
  const onRunMethodSelect = (method) => {
    setSelectedRunMethod(method);
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
          {selectedRunMethod === WITH_LIQUID_AI && (
            <>
              <div id="orchestrator-freezer-line" />
              <div id="orchestrator-washingMachine-line" />
              <div id="orchestrator-intelligentControl-line" />
              <div id="energyCompany-intelligentControl-line" />
              <div id="userControl-intelligentControl-line" />
              <div id="orchestrator-evCharger-line" />
            </>
          )}
          {selectedRunMethod === WITHOUT_LIQUID_AI && (
            <>
              <div id="serviceProvider1-freezer-line" />
              <div id="serviceProvider1-washingMachine-line" />
              <div id="serviceProvider2-evCharger-line" />
            </>
          )}
          {movingDeployments.map((deployment) => (
            <MovingIcon key={deployment.id} deployment={deployment} />
          ))}
          {selectedRunMethod === WITH_LIQUID_AI &&
            activeDeployments.map((deployment, index) => (
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
                  zIndex: 3,
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
                  {selectedRunMethod === WITH_LIQUID_AI && (
                    <img
                      src={Orchestrator}
                      alt="Orchestrator"
                      ref={orchestratorRef}
                      style={{
                        position: "absolute",
                        top: "57%",
                        left: "45%",
                        width: "7%",
                        height: "7%",
                        zIndex: 2,
                      }}
                    />
                  )}
                  {selectedRunMethod === WITH_LIQUID_AI && (
                    <img
                      src={IntelligentControlIcon}
                      alt="IntelligentControl"
                      ref={intelligentControlRef}
                      style={{
                        position: "absolute",
                        top: "57%",
                        left: "25%",
                        width: "6%",
                        height: "7%",
                        zIndex: 2,
                      }}
                    />
                  )}
                  {selectedRunMethod === WITH_LIQUID_AI && (
                    <UserControlUI
                      ref={userControlRef}
                      onUserRequirementChange={(userRequirement, equipment) =>
                        handleUserRequirements(userRequirement, equipment)
                      }
                      optimizedTimeSlots={optimizedTimeSlots}
                    />
                  )}
                  {selectedRunMethod === WITH_LIQUID_AI && (
                    <img
                      src={Energy_Company_Icon}
                      alt="energyCompany"
                      ref={energyCompanyRef}
                      style={{
                        position: "absolute",
                        top: "90%",
                        left: "20.2%",
                        width: "15%",
                        height: "10%",
                        zIndex: 2,
                      }}
                    />
                  )}
                  {selectedRunMethod === WITHOUT_LIQUID_AI && (
                    <>
                      <img
                        src={Service_Provider1}
                        alt="Service_Provider1"
                        ref={serviceProviderRef1}
                        style={{
                          position: "absolute",
                          top: "90%",
                          left: "21.2%",
                          width: "10%",
                          zIndex: 2,
                        }}
                      />
                      <img
                        src={Service_Provider2}
                        alt="Service_Provider2"
                        ref={serviceProviderRef2}
                        style={{
                          position: "absolute",
                          top: "90%",
                          left: "51.2%",
                          width: "10%",
                          zIndex: 2,
                        }}
                      />
                    </>
                  )}
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
                    {/*TEMP add of EV charger TODO: Add proper component for this later*/}
                    <img
                      id="ev-charger-energy"
                      src={EVChargerEnergyIcon}
                      alt="energy"
                      className="washing-machine-energy-border"
                      style={{
                        position: "absolute",
                        top: "51.8%",
                        left: "80%",
                        width: "4.8%",
                        height: "4.8%",
                        zIndex: 2,
                      }}
                    />
                    <button
                      style={{
                        position: "absolute",
                        top: "52.2%",
                        left: "80.35%",
                        width: "4%",
                        height: "4%",
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "0%",
                        zIndex: 2,
                      }}
                    >
                      <img
                        id="washing-machine"
                        src={EVChargerIcon}
                        alt="washingMachine"
                        ref={evChargerRef}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    </button>
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
                  <div style={{ marginBottom: "5%" }}>
                    <DemoControlls
                      onLogAdd={(log) => addLog(log)}
                      continousAnimationRun={continousAnimationRun}
                      runMoveCodeAnimation = {(from, to, icon) => moveCodeAnimation(from, to, icon)}
                      userRequirement={userRequirements}
                      onUpdateOptimizedTimeSlots={(
                        optimizedTimeSlots,
                        equipment
                      ) =>
                        handleOptimizedTimeSlots(optimizedTimeSlots, equipment)
                      }
                      onRunMethodSelect={(value) => onRunMethodSelect(value)}
                    />
                  </div>
                  <DemoDataVisualize logs={logs} />
                  {/* <ServiceProvider
                    ref={serviceProviderRef}
                    onClick={handleQueryClick}
                  /> */}
                  {/* <ElectricityPrice consumptionData={consumptionData} /> */}
                  {selectedRunMethod === WITH_LIQUID_AI && (
                    <a
                      href="https://www.helen.fi/en/electricity/electricity-products-and-prices/exchange-electricity"
                      target="_blank"
                    >
                      Spot price check
                    </a>
                  )}
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
