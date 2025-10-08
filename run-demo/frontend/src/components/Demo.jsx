// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { Accordion, AccordionSummary,
  AccordionDetails, Box, Grid, Typography, Popover, IconButton } from "@mui/material";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import backgroundImage from "./../assets/yard.png";
import controlHub from "./../assets/controlHub.png";
import Service_Provider1 from "./../assets/service_provider1.png";
import Service_Provider2 from "./../assets/service_provider2.png";
import houseImage from "./../assets/house.png";
import House_Warning_Border from "./../assets/house_warning_border.png";
import Freezer from "./visual_components/Freezer";
import WashingMachine from "./visual_components/WashingMachine";
import MovingIcon from "./visual_components/MovingIcon";
import ElectricCar1 from "./visual_components/ElectricCar1";
import ElectricCar2 from "./visual_components/ElectricCar2";
import Jacuzzi from "./visual_components/Jacuzzi";
import EvCharger from "./visual_components/EvCharger";
import Orchestrator from "./../assets/orchestrator.png";
import Storage from "./../assets/storage.png";
import WebAssembly_Icon from "./../assets/WebAssembly_Logo.png";
import EnergyUsageIcon from "./../assets/energy_usage_icon.png";
import roadImage from "./../assets/road.png";
import IntelligentControlIcon from "./../assets/intelligent_control.jpg";
import Energy_Company_Icon from "../assets/spot_price.png";
import FlexibilityServiceIcon from "../assets/flexibility_service.jpg";
import SpotPriceDataIcon from "../assets/spotPriceDataIcon.png";
import TemperatureDataIcon from "../assets/temperature_data_icon.png";
import DangerIcon from "../assets/danger_icon.png";
import userPreferenceIcon from "../assets/user_preference_icon.png";
import HackerIcon from "../assets/hacker_icon.png";
import ScheduleIcon from "../assets/schedule.png";
import CloudIcon from "../assets/cloud_icon.png";
import OptimizedSettingsIcon from "../assets/optimized_settings_icon.png";
import UserControlUI from "./userControl/UserControlUI";
import DemoControlls from "./demoControll/DemoControlls";
import { speak } from "../utils/deviceUtils";
import { fetchData } from '../services/apiService';
import {
  ORCHESTRATOR,
  STORAGE,
  FREEZER,
  WASHING_MACHINE,
  SERVICE_PROVIDER1,
  SERVICE_PROVIDER2,
  ENERGY_COMPANY,
  FLEXIBILITY_SERVICE,
  INTELLIGENT_CONTROL,
  USER_CONTROL,
  EV_CHARGER,
  HACKER,
  WITHOUT_LIQUID_AI,
  WITH_LIQUID_AI,
} from "../../constants";
import { v4 as uuidv4 } from 'uuid';
import { useDemoVisualizationContext } from "../context/demoVisualizationContext/useDemoVisualizationContext";
import { useDemoControlContext } from "../context/demoControlContext/useDemoControlContext";
import OperatingTimeChart from "./visual_components/OperatingTimeChart";
import SpotPriceChart from "./visual_components/SpotPriceChart";
import ElectricityPrice from "./visual_components/ElectricityPrice";
import { cloudBasedPlan, liquidBasedPlanFinal } from "../assets/mockData/dailyPlan"
import { List, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { keyframes } from "@mui/system";
import socket from "./WebSocket";

// eslint-disable-next-line no-undef
const PUBLIC_HOST = import.meta.env.VITE_PUBLIC_HOST;
// eslint-disable-next-line no-undef
const PUBLIC_PORT = import.meta.env.VITE_PUBLIC_PORT;
// eslint-disable-next-line no-undef
const DEVICE_CHECK_INTERVAL = import.meta.env.VITE_DEVICE_CHECK_INTERVAL;
// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = import.meta.env.VITE_ANIMATION_MOVING_TIME;

const DATA_ICONS_MOVING_FROM_WM = [EnergyUsageIcon, userPreferenceIcon];
const DATA_ICONS_MOVING_FROM_FREEZER = [EnergyUsageIcon, userPreferenceIcon, TemperatureDataIcon];
const DATA_ICONS_MOVING_FROM_EV = [EnergyUsageIcon, userPreferenceIcon];
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Demo = () => {
  const orchestratorRef = useRef(null);
  const storageRef = useRef(null);
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
  const flexibilityServiceRef = useRef(null);
  const evChargerRef = useRef(null);
  const hackerRef = useRef(null);
  const containerRef = useRef(null);
  const hourglassRef = useRef(null);
  const logsQueueRef = useRef([]);
  const hasRun = useRef(false);
  const [activeDeployments, setActiveDeployments] = useState([]);
  const [warningBorderVisible, setWarningBorderVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [shouldBlink, setShouldBlink] = useState(false);
  const { deviceStatus, hackerVisibility, movingDeployments, setMovingDeployments } = useDemoVisualizationContext();
  const { demoRunMethod, demoTime, scheduleProcessing, voiceEnabled } = useDemoControlContext();
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused); 
  const [referenceLineEnabled, setReferenceLineEnabled] = useState(false);
  const [referenceLinePosition, setReferenceLinePosition] = useState(50); // start middle
  const [activePopover, setActivePopover] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [index, setIndex] = useState(0);
  const [rescheduleHistory, setRescheduleHistory] = useState([]);
  const voiceEnabledRef = useRef(voiceEnabled);

  let totalConsumptionCloudBased = [];
  let totalConsumptionLiquidBased = [];

  for (let i = 0; i <= 23; i++) {
    totalConsumptionCloudBased.push({ hour: i, value: 0 });
    totalConsumptionLiquidBased.push({ hour: i, value: 0 });
  }

  cloudBasedPlan.forEach((c) => {
    const data = c.slots;
    data.forEach((d) => {
      for (let hour = d.start; hour < d.end; hour++) {
        const consumptionHour = totalConsumptionCloudBased.find((obj) => obj.hour === hour);
        if (consumptionHour) {
          consumptionHour.value += d.value;
        }
      }
    });
  });

  liquidBasedPlanFinal.forEach((c) => {
    const data = c.slots;
    data.forEach((d) => {
      for (let hour = d.start; hour < d.end; hour++) {
        const consumptionHour = totalConsumptionLiquidBased.find((obj) => obj.hour === hour);
        if (consumptionHour) {
          consumptionHour.value += d.value;
        }
      }
    });
  });

  const handleDrag = (e) => {
    if (!referenceLineEnabled || !containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    if (x >= 0 && x <= 100) {
      setReferenceLinePosition(x);
    }
  };

  const pauseAwareDelay = (ms, isPausedRef) => {
    return new Promise((resolve) => {
      let elapsed = 0;
      const interval = 50; // check every 50ms
      const timer = setInterval(() => {
        if (!isPausedRef.current) {
          elapsed += interval;
        }
        if (elapsed >= ms) {
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  };

  const handleClick = () => {
    setOpen(!open);
  };

  const handlePopOverClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActivePopover(id);
  };

  const handlePopOverClose = () => {
    setAnchorEl(null);
    setActivePopover(null);
  };

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
      [STORAGE]: storageRef,
      [SERVICE_PROVIDER1]: serviceProviderRef1,
      [SERVICE_PROVIDER2]: serviceProviderRef2,
      [INTELLIGENT_CONTROL]: intelligentControlRef,
      [USER_CONTROL]: userControlRef,
      [EV_CHARGER]: evChargerRef,
      [ENERGY_COMPANY]: energyCompanyRef,
      [FLEXIBILITY_SERVICE]: flexibilityServiceRef,
      [HACKER]: hackerRef,
      // Add more device names and their references here
    }),
    []
  );

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
            elapsedTime: 0,
            //endTime: Date.now() + animationDuration, // Calculate the end time
          };
  
          /* setMovingDeployments((prevDeployments) => {
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
          }); */

          setMovingDeployments((prev) => [...prev, newMovingDeployments]);

          // Pause-aware timer for removal
          let elapsed = 0;
          const interval = 50; // check every 50ms

          const timer = setInterval(() => {
            if (!pausedRef.current) {
              elapsed += interval;
            }
            if (elapsed >= animationDuration) {
              clearInterval(timer);
              setMovingDeployments((current) =>
                current.filter((dep) => dep.id !== uniqueId)
              );
              resolve();
            }
          }, interval);
        } else {
          resolve(); // Resolve immediately if the end device is not found
        }
      });
    },
    [getDeviceReference]
  );

  // Handle animation of icon movements
  const continousAnimationRun = async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    if (demoRunMethod === WITH_LIQUID_AI) {
      moveCodeAnimation(ENERGY_COMPANY, INTELLIGENT_CONTROL, SpotPriceDataIcon);
    } else {
        // Randomly pick an icon from each set
        const randomIconsFromWM = DATA_ICONS_MOVING_FROM_WM[Math.floor(Math.random() * DATA_ICONS_MOVING_FROM_WM.length)];
        const randomIconsFromFreezer = DATA_ICONS_MOVING_FROM_FREEZER[Math.floor(Math.random() * DATA_ICONS_MOVING_FROM_FREEZER.length)];
        const randomIconsFromEV = DATA_ICONS_MOVING_FROM_EV[Math.floor(Math.random() * DATA_ICONS_MOVING_FROM_EV.length)];

      // Animation for the whole process while querying the energy data from the devices to external service providers
      moveCodeAnimation(
        EV_CHARGER,
        SERVICE_PROVIDER2,
        randomIconsFromEV,
        DangerIcon
      );
      moveCodeAnimation(
        FREEZER,
        SERVICE_PROVIDER1,
        randomIconsFromFreezer,
        DangerIcon
      );
      moveCodeAnimation(
        WASHING_MACHINE,
        SERVICE_PROVIDER1,
        randomIconsFromWM,
        DangerIcon
      );
      await delay(100);

      setTimeout(() => {
        startBlinking(); // Start blinking the house border when data going outside the house
      }, 1200);

      await delay(1500);

      // Animation for the whole process while sending the optimized plan from the external service providers to devices
      moveCodeAnimation(SERVICE_PROVIDER1, FREEZER, OptimizedSettingsIcon);
      moveCodeAnimation(SERVICE_PROVIDER1, WASHING_MACHINE, OptimizedSettingsIcon);
      moveCodeAnimation(SERVICE_PROVIDER2, EV_CHARGER, OptimizedSettingsIcon);
    }
  };

  // Fetch the device data from the API
  const fetchDeviceData = async () => {
    try {
      const devicesFromAPI = await fetchData("/file/device");
      const deviceIdMap = new Map(
        devicesFromAPI.map((device) => [device.name, device._id])
      );
      localStorage.setItem(
        "deviceIdMap",
        JSON.stringify(Array.from(deviceIdMap.entries()))
      );
      const devicesMap = new Map();
      for (const [deviceName, deviceId] of deviceIdMap.entries()) {
        devicesMap.set(deviceName, {
          name: deviceName,
          deviceId: deviceId,
          lastUpdateTime: null,
          deploymentId: null,
          existingModuleId: null,
          existingModuleName: null,
          isModuleActive: false,
          isActive: false,
        });
      }
      localStorage.setItem("devices", JSON.stringify(Array.from(devicesMap.values())));
      if (voiceEnabled)
        speak("Available supervisors have been detected and attached to devices.");
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  };

  // Update the deployment details for the device
  const updateDeployment = useCallback(async (device, deviceName) => {
      const deployments = JSON.parse(localStorage.getItem("deployments") || "[]");
      const deviceSpecificDeployment = deployments.find((item) =>
        item.sequence.some((seq) => seq.device === device.deviceId)
      );
      if (deviceSpecificDeployment) {
        // Accessing the modules inside fullManifest using the deviceId
        const deviceManifest = deviceSpecificDeployment.fullManifest[device.deviceId];
        device.deploymentId = deviceSpecificDeployment._id;
        device.existingModuleId = deviceManifest.modules[0].id;
        device.existingModuleName = deviceManifest.modules[0].name;
        device.isModuleActive = true;

        const demoDevice = deviceStatus.find((item) =>
          item.supervisorName == deviceName
        );
        const deviceRef = getDeviceReference(demoDevice.deviceName);
        if (deviceRef.current && device.isModuleActive) {
          moveCodeAnimation(ORCHESTRATOR, demoDevice.deviceName, WebAssembly_Icon);
          await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
          if (voiceEnabledRef.current)
            speak(`${device.existingModuleName} module has been deployed on ${demoDevice.deviceName} device`);
        } 
      } else {
        device.deploymentId = null;
        device.existingModuleId = null;
        device.existingModuleName = null;
        device.isModuleActive = false;
      }
    },
    [getDeviceReference]
  );

  // Collect logs in a queue and process them in batch
  const processLogsQueue = useCallback(async () => {
    const logs = logsQueueRef.current;
    if (logs.length === 0) return;
  
    // Get existing devices from localStorage
    let existingDevices = JSON.parse(localStorage.getItem("devices")) || [];
    const deviceMap = new Map(existingDevices.map((d) => [d.name, d]));

    // Get deviceIdMap from localStorage (or API)
    const deviceIdMap = JSON.parse(localStorage.getItem("deviceIdMap")) || [];

    const now = Date.now();
    const expiryTime = parseInt(DEVICE_CHECK_INTERVAL) + 2000; // ms

    // Process logs and update devices accordingly
    for (const log of logs) {
      const logReceivedTime = new Date(log.dateReceived).getTime();
      if (log.funcName === "thingi_health" && log.loglevel === "INFO") {
        // Update lastUpdateTime and mark as active
        const existing = deviceMap.get(log.deviceName);
        deviceMap.set(log.deviceName, {
          ...existing,
          lastUpdateTime: logReceivedTime,
          isActive: true,
        });
      } else if (log.funcName === "deployment_create") {
        updateDeployment(
          deviceMap.get(log.deviceName),
          log.deviceName
        );
      } else if (log.funcName === "do_wasm_work") {
        if (log.message && log.message.startsWith("Execution result:")) {
          const demoDevice = deviceStatus.find((item) =>
            item.supervisorName == log.deviceName
          );
          moveCodeAnimation(ORCHESTRATOR, demoDevice.deviceName, ScheduleIcon);
          await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
          if (voiceEnabledRef.current)
            speak(`${log.module_name} module is successfully executed on device ${demoDevice.deviceName}`);
        }
      }
    }

    // Optional: filter out stale devices based on expiryTime
    const updatedDevices = Array.from(deviceMap.values()).map((device) => {
      const isStillActive = now - device.lastUpdateTime < expiryTime;
      return {
        ...device,
        isActive: device.isActive && isStillActive,
      };
    });
      
    // Save updated list back to localStorage
    localStorage.setItem("devices", JSON.stringify(updatedDevices));
  
    // Clear the queue
    logsQueueRef.current = [];
  }, [voiceEnabled]);

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
 
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("📩 Message:", JSON.parse(event.data));
      logsQueueRef.current.push(JSON.parse(event.data));
      setTimeout(processLogsQueue, 500);
    };

    // Function to fetch and save deployments
    const fetchDeployments = async () => {
      try {
        const deployments = await fetchData("/file/manifest");
        localStorage.setItem("deployments", JSON.stringify(deployments));
      } catch (error) {
        console.error("Error fetching deployments:", error);
      }
    };

    const intervalId = setInterval(fetchDeployments, 5 * 60 * 1000); // change 5 to 10 for 10 minutes

    if (!hasRun.current) {
      fetchDeviceData();   
      getInitialDeviceHealth();
      socket.addEventListener("message", handleMessage);
      hasRun.current = true;
      fetchDeployments();
    }

    return() => {
      clearInterval(intervalId);
      //socket.removeEventListener("message", handleMessage);
    }
  }, []);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    pausedRef.current = paused;
    // This logic will draw a line between the orchestrator and the equipment
    const drawLines = (
      point_A_ref,
      point_A_name,
      point_B_ref,
      point_B_name,
      lineColor = "green"
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
          borderTop: `2px dashed ${lineColor}`,
          zIndex: 1,
        };

        const lineElement = document.getElementById(
          `${point_A_name}-${point_B_name}-line`
        );
        Object.assign(lineElement.style, lineStyle);
      }
    };

    if (demoRunMethod === WITH_LIQUID_AI) {
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
      drawLines(
        flexibilityServiceRef,
        FLEXIBILITY_SERVICE,
        intelligentControlRef,
        INTELLIGENT_CONTROL
      );
      drawLines(orchestratorRef, ORCHESTRATOR, storageRef, STORAGE);

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
      window.addEventListener("resize", () =>
        drawLines(
          flexibilityServiceRef,
          FLEXIBILITY_SERVICE,
          intelligentControlRef,
          INTELLIGENT_CONTROL
        )
      );
      window.addEventListener("resize", () =>
        drawLines(orchestratorRef, ORCHESTRATOR, storageRef, STORAGE)
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
      if(hackerVisibility) {
        drawLines(serviceProviderRef1, SERVICE_PROVIDER1, hackerRef, HACKER, "red");
        drawLines(serviceProviderRef2, SERVICE_PROVIDER2, hackerRef, HACKER, "red");
      }
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
      if(hackerVisibility) {
        window.addEventListener("resize", () =>
          drawLines(serviceProviderRef1, SERVICE_PROVIDER1, hackerRef, HACKER, "red")
        );
        window.addEventListener("resize", () =>
          drawLines(serviceProviderRef2, SERVICE_PROVIDER2, hackerRef, HACKER, "red")
        );
      }
    }

    return () => {
      if (demoRunMethod === WITH_LIQUID_AI) {
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
        window.removeEventListener("resize", () =>
          drawLines(
            flexibilityServiceRef,
            FLEXIBILITY_SERVICE,
            intelligentControlRef,
            INTELLIGENT_CONTROL
          )
        );
        window.removeEventListener("resize", () =>
          drawLines(orchestratorRef, ORCHESTRATOR, storageRef, STORAGE)
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
        if(hackerVisibility) {
          window.removeEventListener("resize", () =>
            drawLines(serviceProviderRef1, SERVICE_PROVIDER1, hackerRef, HACKER, "red")
          );
          window.removeEventListener("resize", () =>
            drawLines(serviceProviderRef2, SERVICE_PROVIDER2, hackerRef, HACKER, "red")
          );
        }
      }
    };
  }, [demoRunMethod, hackerVisibility, paused]);

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
          {demoRunMethod === WITH_LIQUID_AI && (
            <>
              <div id="orchestrator-freezer-line" />
              <div id="orchestrator-washingMachine-line" />
              <div id="orchestrator-intelligentControl-line" />
              <div id="energyCompany-intelligentControl-line" />
              <div id="flexibilityService-intelligentControl-line" />
              <div id="userControl-intelligentControl-line" />
              <div id="orchestrator-evCharger-line" />
              <div id="orchestrator-storage-line" />
            </>
          )}
          {demoRunMethod === WITHOUT_LIQUID_AI && (
            <>
              <div id="serviceProvider1-freezer-line" />
              <div id="serviceProvider1-washingMachine-line" />
              <div id="serviceProvider2-evCharger-line" />
              <AnimatePresence initial={false}>
                {hackerVisibility ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 1, ease: "easeInOut" },
                    }}
                  >
                    <div id="serviceProvider1-hacker-line" />
                    <div id="serviceProvider2-hacker-line" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>
          )}
          {movingDeployments.map((deployment) => (
            <MovingIcon key={deployment.id} deployment={deployment} paused={paused} />
          ))}
          {demoRunMethod === WITH_LIQUID_AI &&
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
                  {demoRunMethod === WITH_LIQUID_AI && (
                    <div
                      style={{
                        position: "absolute",
                        top: "57%",
                        left: "45%",
                        width: "7%",
                        height: "7%",
                        zIndex: 2,
                      }}
                      ref={orchestratorRef}
                    >
                      <img
                        src={Orchestrator}
                        alt="Orchestrator"
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      />
                      {scheduleProcessing && (
                        <>
                          <motion.div
                            ref={hourglassRef}
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            style={{
                              position: "absolute",
                              padding: "10px",
                              bottom: "-18%",    
                              right: "-20%",
                              width: "34%",       
                              height: "34%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(166, 221, 175, 0.85)",
                              borderRadius: "50%",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                              cursor: "pointer"
                            }}
                            onClick={(e) => handlePopOverClick(e, "orchestrator")}
                          >
                            <HourglassFullIcon style={{ fontSize: "1.0rem", color: "#167356" }} />
                          </motion.div>
                          <Popover
                            open={activePopover === "orchestrator"}
                            anchorEl={anchorEl}
                            onClose={handlePopOverClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                          >
                            <Box p={2} sx={{ maxWidth: 250 }}>
                              <strong>Orchestrator</strong>
                              <p>
                                Orchestrator gets schedule information from intelligence control.<br />
                                Then, it forwards the schedule times to the concerned devices.
                              </p>
                            </Box>
                          </Popover>
                        </>
                      )}
                    </div>
                  )}
                  {demoRunMethod === WITH_LIQUID_AI && (
                    <img
                      src={Storage}
                      alt="Storage"
                      ref={storageRef}
                      style={{
                        position: "absolute",
                        top: "60%",
                        left: "55%",
                        width: "6%",
                        height: "7%",
                        zIndex: 2,
                      }}
                    />
                  )}
                  {demoRunMethod === WITH_LIQUID_AI && (
                    <div
                      style={{
                        position: "absolute",
                        top: "57%",
                        left: "25%",
                        width: "6%",
                        height: "7%",
                        zIndex: 2,
                      }}
                      ref={intelligentControlRef}
                    >
                      <img
                        src={IntelligentControlIcon}
                        alt="IntelligentControl"
                        style={{
                          width: "100%",
                          height: "100%"
                        }}
                      />
                      {scheduleProcessing && (
                        <>
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            style={{
                              position: "absolute",
                              padding: "10px",
                              top: "-10%",    
                              right: "-22%",
                              width: "34%",       
                              height: "34%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(166, 221, 175, 0.85)",
                              borderRadius: "50%",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                              cursor: "pointer"
                            }}
                            onClick={(e) => handlePopOverClick(e, "intelligence")}
                          >
                            <HourglassFullIcon style={{ fontSize: "1.0rem", color: "#167356" }} />
                          </motion.div>
                          <Popover
                            open={activePopover === "intelligence"}
                            anchorEl={anchorEl}
                            onClose={handlePopOverClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                          >
                            <Box p={2} sx={{ maxWidth: 250 }}>
                              <strong>Intelligence Control</strong>
                              <p>
                                Intelligence Control gets spot price information from spot price controller.<br />
                                It then sends the optimal electricity consumption times to the Orchestrator.
                              </p>
                            </Box>
                          </Popover>
                        </>
                      )}
                    </div>
                  )}
                  {demoRunMethod === WITH_LIQUID_AI && (
                    <UserControlUI ref={userControlRef} anchorPopOverEl={anchorEl} activePopover={activePopover} handlePopOverClick={handlePopOverClick} handlePopOverClose={handlePopOverClose} />
                  )}
                  {demoRunMethod === WITH_LIQUID_AI && (
                    <div
                      style={{
                        position: "absolute",
                        top: "90%",
                        left: "10.2%",
                        width: "15%",
                        height: "10%",
                        zIndex: 2,
                      }}
                      ref={energyCompanyRef}
                    >
                      <img
                        src={Energy_Company_Icon}
                        alt="energyCompany"
                        style={{
                          width: "100%",
                          height: "100%"
                        }}
                      />
                      {scheduleProcessing && ((new Date(demoTime).getHours() === 0 && new Date(demoTime).getMinutes() === 30)) && (
                        <>
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            style={{
                              position: "absolute",
                              padding: "10px",
                              bottom: "-4%",    
                              right: "-4%",
                              width: "18%",       
                              height: "30%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(166, 221, 175, 0.85)",
                              borderRadius: "50%",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                              cursor: "pointer"
                            }}
                            onClick={(e) => handlePopOverClick(e, "energy")}
                          >
                            <HourglassFullIcon style={{ fontSize: "1.0rem", color: "#167356" }} />
                          </motion.div>
                          <Popover
                            open={activePopover === "energy"}
                            anchorEl={anchorEl}
                            onClose={handlePopOverClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                          >
                            <Box p={2} sx={{ maxWidth: 250 }}>
                              <strong>Energy Provider</strong>
                              <p>
                                Energy provider sends the new price information (for the current hour) to Intelligence control.
                              </p>
                            </Box>
                          </Popover>
                        </>
                      )}
                    </div>
                  )}
                  {demoRunMethod === WITH_LIQUID_AI && (
                    <div
                      style={{
                        position: "absolute",
                        top: "90%",
                        left: "40.2%",
                        width: "10%",
                        height: "10%",
                        zIndex: 2,
                      }}
                      ref={flexibilityServiceRef}
                    >
                      <img
                        src={FlexibilityServiceIcon}
                        alt="FlexibilityServiceIcon"
                        style={{
                          width: "100%",
                          height: "100%"
                        }}
                      />
                      {scheduleProcessing && (((new Date(demoTime).getHours() === 4 || new Date(demoTime).getHours() === 13 || new Date(demoTime).getHours() === 21) && new Date(demoTime).getMinutes() === 0)) && ( 
                        <>
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            style={{
                              position: "absolute",
                              padding: "10px",
                              top: "-8%",    
                              right: "-10%",
                              width: "28%",       
                              height: "30%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(166, 221, 175, 0.85)",
                              borderRadius: "50%",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                              cursor: "pointer"
                            }}
                            onClick={(e) => handlePopOverClick(e, "flexibility")}
                          >
                            <HourglassFullIcon style={{ fontSize: "1.0rem", color: "#167356" }} />
                          </motion.div>
                          <Popover
                            open={activePopover === "flexibility"}
                            anchorEl={anchorEl}
                            onClose={handlePopOverClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                          >
                            <Box p={2} sx={{ maxWidth: 250 }}>
                              <strong>Flexibility Service</strong>
                              <p>
                                The Flexibility Service compares the new price data with previous values and identifies any significant changes, such as price spikes. <br />
                                This information is then communicated to the Intelligence Control.
                              </p>
                            </Box>
                          </Popover>
                        </>
                      )}
                    </div>
                  )}
                  {demoRunMethod === WITH_LIQUID_AI && rescheduleHistory.length > 0 && (
                    <Accordion
                      sx={{
                        position: "absolute",
                        top: "84%",
                        left: "60.2%",
                        width: "40%",
                        zIndex: 2,
                        backgroundColor: "#7bc7d1",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: "white" }} />}
                        sx={{
                          backgroundColor: "#2b717a",
                          color: "white",
                          borderRadius: "8px 8px 0px 0px",
                        
  
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                          <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1 }}>
                            Device Schedule Info
                          </Typography>
                        </Box>
                      </AccordionSummary>               
                      <AccordionDetails
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          padding: "10px",
                        }}
                      >
                        <Typography variant="body1" sx={{ marginBottom: 2, textAlign: "justify" }}>
                          When energy price changes occur, the system dynamically adjusts device
                          schedules to optimize consumption. The recalculation process happens on
                          the following times:
                        </Typography>
                        <Box
                          sx={{
                            flexGrow: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            padding: "8px",
                          }}
                        >
                          {/* Left Arrow */}
                          <IconButton
                            onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
                            disabled={index === 0}
                            sx={{
                              position: "absolute",
                              left: "4px",
                              top: "20%",
                              height: "30px",
                              width: "30px",
                              zIndex: 3,
                              backgroundColor: "rgba(255,255,255,0.7)",
                            }}
                          >
                            <ArrowBackIos sx={{ paddingLeft: "4px", fontSize: "18px", cursor: "pointer" }} />
                          </IconButton>
                  
                          {/* Step Text */}
                          <Box
                            sx={{
                              position: "relative",
                              top: "-30px",
                              width: "100%",
                              height: "100%",
                              padding: "20px",
                              overflow: "hidden",
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                marginBottom: 2,
                                backgroundColor: "lightgrey",
                                textAlign: "center",
                              }}
                            >
                              {rescheduleHistory[index] && rescheduleHistory[index].title}
                            </Typography>
                            <Typography variant="body1" sx={{ padding: "10px", textAlign: "center" }}>
                              {rescheduleHistory[index] && rescheduleHistory[index].content}
                            </Typography>
                          </Box>
                  
                          {/* Right Arrow */}
                          <IconButton
                            onClick={() => setIndex((prev) => Math.min(prev + 1, rescheduleHistory.length - 1))}
                            disabled={index === rescheduleHistory.length - 1}
                            sx={{
                              position: "absolute",
                              right: "4px",
                              top: "20%",
                              height: "30px",
                              width: "30px",
                              backgroundColor: "rgba(255,255,255,0.7)",
                            }}
                          >
                            <ArrowForwardIos sx={{ fontSize: "14px", cursor: "pointer" }} />
                          </IconButton>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  )}
                  {demoRunMethod === WITHOUT_LIQUID_AI && (
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
                      <AnimatePresence initial={false}>
                        {hackerVisibility ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              opacity: { duration: 1, ease: "easeInOut" },
                            }}
                          >
                            <img
                              src={HackerIcon}
                              alt="HackerIcon"
                              ref={hackerRef}
                              style={{
                                position: "absolute",
                                top: "85%",
                                left: "90.2%",
                                width: "10%",
                                height: "15%",
                                zIndex: 2,
                              }}
                            />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                      <img
                        src={CloudIcon}
                        alt="CloudIcon"
                        style={{
                          position: "absolute",
                          top: "87%",
                          left: "11.2%",
                          width: "65%",
                          height: "19%",
                          zIndex: 0,
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
                    <EvCharger ref={evChargerRef} />
                  </div>
                </div>
              </div>
            </Box>
          </Grid>
          <Grid item xs={2} style={{ position: "relative", marginTop: "15px"}}>
            <Grid container spacing={1.5} columns={1}>
              <Grid item xs={1} minWidth="50vh" style={{paddingLeft: "0px", marginBottom: "10px"}}>
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
                  <div style={{ marginBottom: "1%" }}>
                    <DemoControlls
                      continousAnimationRun={continousAnimationRun}
                      runMoveCodeAnimation={(from, to, icon) =>
                        moveCodeAnimation(from, to, icon)
                      }
                      setPaused={setPaused}
                      pausedRef={pausedRef}
                      pauseAwareDelay={pauseAwareDelay}
                      referenceLineEnabled={referenceLineEnabled}
                      setReferenceLineEnabled={setReferenceLineEnabled}
                      handlePopOverClose={handlePopOverClose}
                      setRescheduleHistory={setRescheduleHistory}
                    />
                  </div>
                </Box>
              </Grid>
              <Box
                ref={containerRef}
                sx={{ position: "relative", width: "100%" }}
                onMouseDown={handleDrag}
                onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
              >
                <Grid item xs={1} paddingBottom="5px">
                  <Box>
                    <List
                      sx={{ width: "100%", 
                      bgcolor: "background.paper",
                      border: "1px solid #DCDCDC",
                      borderRadius: "5px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                      paddingBottom: "0px",
                      paddingTop: "0px"
                      }}
                    >
                      <ListItemButton
                        onClick={handleClick}
                        sx={{ width: "100%" }}
                      >
                        <ListItemText
                          primary={
                            <Typography style={{ fontWeight: "bolder" }}>
                              Spot Price Chart
                            </Typography>
                          }
                        />
                        {open ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                      <Collapse in={open} timeout="auto" unmountOnExit>
                        <SpotPriceChart />
                      </Collapse>
                    </List>
                  </Box>
                </Grid>
                <Grid item xs={1} paddingBottom="5px">
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
                    {demoRunMethod === WITHOUT_LIQUID_AI && (
                      <ElectricityPrice
                        demoTime={demoTime}
                        demoPassedHrs={parseInt(new Date(demoTime).getHours())}
                        totalConsumption={totalConsumptionCloudBased}
                      />
                    )}
                    {demoRunMethod === WITH_LIQUID_AI && (
                      <ElectricityPrice
                        demoTime={demoTime}
                        demoPassedHrs={parseInt(new Date(demoTime).getHours())}
                        totalConsumption={totalConsumptionLiquidBased}
                      />
                    )}
                  </Box>
                </Grid>
                <Grid item xs={1} paddingBottom="5px">
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
                    <OperatingTimeChart />
                  </Box>
                </Grid>
                {referenceLineEnabled && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: `calc(${referenceLinePosition}% - 30px)`,
                      height: "100%",
                      width: "20px", 
                      backgroundColor: "rgba(255, 205, 205, 0.5)", 
                      border: "2px solid rgba(192, 64, 64, 0.9)",
                      cursor: "grab",
                      backdropFilter: "brightness(1.1)",
                      boxShadow: "inset 0 0 15px rgba(0,0,0,0.6)",
                      zIndex: 100,
                      transition: "left 0.05s linear",
                      userSelect: "none"
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Demo;