//Copyright 2025 Tampere Unievrsity 
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Asma Jamil <asma.jamil@tuni.fi>.


import React from "react";
import { useEffect, useState, useRef } from "react";
import { Box, Grid, Typography, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, Tooltip } from "@mui/material";
import DatabaseImg from '../../assets/database.png';
import OrchestratorImg from '../../assets/orchestrator.png';
import IntelligenceControlImg from '../../assets/intelligent_control.jpg';
import FreezerImg from '../../assets/freezer.png';
import WashingMachineImg from '../../assets/washing_machine.png';
import EVChargerImg from '../../assets/ev_charger.png';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import { fetchData } from '../../services/apiService';
import activeIcon from '../../assets/active.png';
import inactiveIcon from '../../assets/inactive.png';
import { useDemoControlContext } from "../../context/demoControlContext/useDemoControlContext";
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";
import { WITH_LIQUID_AI } from "../../../constants";
import { ANIMATION_EVENT_SEQUENCE } from "../../assets/mockData/eventSequence";
import NewDeviceDiscoveryIcon from "../../assets/new-device.png";
import NewDeviceInfoIcon from "../../assets/new-device-info.png";
import SocketMsgIcon from "../../assets/socket-icon.png";
import WasmWithOnnxScheduleIcon from "../../assets/wasm_with_onnx_schedule.png";
import ScheduleIcon from "../../assets/schedule.png";
import QueryIcon from "../../assets/query-info.png";
import QueryResponseIcon from "../../assets/query-response.png";
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import { execute } from "../../utils/deviceUtils";
import { FREEZER } from "../../../constants";
// eslint-disable-next-line no-undef
const ORCHESTRATOR_HOST = import.meta.env.VITE_ORCHESTRATOR_HOST;

const iconMap = {
  NewDeviceDiscoveryIcon,
  NewDeviceInfoIcon,
  WasmWithOnnxScheduleIcon,
  SocketMsgIcon,
  ScheduleIcon,
  QueryIcon,
  QueryResponseIcon
};


export default function ArchitectureDiagram({ socketMsg, isPaused }) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [modules, setModules] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const devices = JSON.parse(localStorage.getItem('devices') || '[]');
  const [isFreezerActive, setIsFreezerActive] = useState(devices.find(device => device.name === "freezer").isActive);
  const [isWMActive, setIsWMActive] = useState(devices.find(device => device.name === "washing-machine").isActive);
  const [isEVActive, setIsEVActive] = useState(devices.find(device => device.name === "ev-charger").isActive);
  const isPausedRef = useRef(isPaused);
  const { demoRunning, demoStatus, demoTime, changeDemoRunMethod, eventProgress, setEventProgress, animateLines, eventAnimationActive, setEventAnimationActive, runGlobalAnimation } = useDemoControlContext();
  const eventAnimationActiveRef = useRef(eventAnimationActive);
  const { deviceWorkInfo, updateDeviceWorkInfo, updateDeviceModuleStatus } = useDemoVisualizationContext();
  const [openOrchestratorDialog, setOpenOrchestratorDialog] = useState(false);
  const [detailsCache, setDetailsCache] = useState({}); // cache fetched info
  const [activeDeployments, setActiveDeployments] = useState({});

  const currentDate = new Date(demoTime);
  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  const showHourglass = (currentHour > 0) || (currentHour === 0 && currentMinute >= 40);

  useEffect(() => {
    eventAnimationActiveRef.current = eventAnimationActive;
  }, [eventAnimationActive]);

  // Configuration for self deployment animations
  const supervisorDeploymentSchedule = {
    "freezer": [{ hour: 3, minute: 0 }, { hour: 5, minute: 0 }, { hour: 7, minute: 0 }, { hour: 9, minute: 0 }, { hour: 20, minute: 0 }, { hour: 22, minute: 0 }],
    "washing-machine": [{ hour: 8, minute: 0 }, { hour: 9, minute: 0 }, { hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 15, minute: 0 }, { hour: 17, minute: 0 }],
    "ev-charger": [{ hour: 1, minute: 0 }, { hour: 5, minute: 0 }, { hour: 7, minute: 0 }, { hour: 8, minute: 0 }, { hour: 9, minute: 0 }, { hour: 21, minute: 0 }, { hour: 23, minute: 0 }],
  };

  useEffect(() => {
    if (!demoRunning) return;
    Object.keys(supervisorDeploymentSchedule).forEach(device => {
      const schedules = supervisorDeploymentSchedule[device];
      schedules.forEach(schedule => {
        if (currentHour === schedule.hour && currentMinute === schedule.minute) {
          if (!activeDeployments[device]) {
            setActiveDeployments(prev => ({ ...prev, [device]: true }));
            setTimeout(() => {
              setActiveDeployments(prev => ({ ...prev, [device]: false }));
            }, 4000);
          }
        }
      });
    });
  }, [currentHour, currentMinute, demoRunning, deviceWorkInfo]);

  const handleAccordionChange = async (type, id, expanded) => {
    if (!expanded) return; // only fetch when opened
    if (detailsCache[id]) return; // already fetched
    let url = type === 'module'
      ? `${ORCHESTRATOR_HOST}/file/module/${id}`
      : `${ORCHESTRATOR_HOST}/file/manifest/${id}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setDetailsCache(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error(`Failed to fetch ${type} details:`, err);
    }
  };

  const fetchAndSetData = async () => {
    if (eventAnimationActive) return;
    try {
      setLoading(true);
      setExpanded(false);
      runGlobalAnimation("normalDir", "dbLine", null, "Retrieving data", isPausedRef);
      const modules = await fetchData("/file/module");
      const deployments = await fetchData("/file/manifest");
      if (deployments || modules) {
        // Wait 2 seconds before processing data
        await new Promise(resolve => setTimeout(resolve, 1200));
        const moduleItems = Array.isArray(modules)
          ? modules.map(item => ({ _id: item._id, name: item.name }))
          : [];
        const deploymentItems = Array.isArray(deployments)
          ? deployments.map(item => ({ _id: item._id, name: item.name }))
          : [];
        setModules(modules);
        setDeployments(deployments);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setLoading(false);
        setExpanded(true);
      }
    } catch (error) {
      console.error("Error fetching deployments:", error);
      setLoading(false);
    }
  };

  const runAnimationEvent = async (event) => {
    setEventAnimationActive(true);
    let storedProgress = eventProgress[event.id] || { step: 1, completed: false };
    const currentStep = storedProgress.step || 1;
    const totalSteps = event.steps.length;
    if (storedProgress.completed) return;
    if (isPausedRef.current) return;
    for (let i = currentStep; i <= totalSteps; i++) {
      const step = event.steps[i - 1];
      const updatedProgress = { step: i, completed: i >= totalSteps };
      setEventProgress((prev) => ({
        ...prev,
        [event.id]: updatedProgress,
      }));
      if (Array.isArray(step[0])) {
        await Promise.all(step.map(s => runGlobalAnimation(...s, isPausedRef)));
      } else {
        await runGlobalAnimation(...step, isPausedRef);
      }
    }
    setEventAnimationActive(false);
  };

  useEffect(() => {
    changeDemoRunMethod(WITH_LIQUID_AI);
    fetchAndSetData();
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const handleSocketMsg = async () => {
      if (!socketMsg) return;
      // Skip processing if paused
      if (isPausedRef.current || eventAnimationActive) return;

      if (socketMsg && socketMsg.funcName.includes("thingi_health") && socketMsg.loglevel === "INFO") {
        if (socketMsg.deviceName === "freezer") {
          await runGlobalAnimation("normalDir", "freezerLine", "SocketMsgIcon", "Health check done", isPausedRef);
          setIsFreezerActive(devices.find(device => device.name === "freezer").isActive);
        }
        if (socketMsg.deviceName === "washing-machine") {
          await runGlobalAnimation("normalDir", "wmLine", "SocketMsgIcon", "Health check done", isPausedRef);
          setIsWMActive(devices.find(device => device.name === "washing-machine").isActive);
        }
        if (socketMsg.deviceName === "ev-charger") {
          await runGlobalAnimation("normalDir", "evLine", "SocketMsgIcon", "Health check done", isPausedRef);
          setIsEVActive(devices.find(device => device.name === "ev-charger").isActive);
        }
      }
    }
    if (demoRunning && demoStatus === "running")
      handleSocketMsg();
  }, [socketMsg, demoRunning, demoStatus]);

  const runQueryAnimations = async () => {
    if (currentHour == 1 && currentMinute == 30) {
      updateDeviceModuleStatus("ev-charger", "ev_control:ExecuteEvent(3) -> IsCharging()");
      updateDeviceWorkInfo("ev-charger", "ExecuteEvent(3) -> IsCharging()", "01:30");
      const result = await execute("693ff67e75d1501dc7e8fb4f", "ev-charger", { "param0": 3, "param1": 0, "param2": 0, "param3": 0 });
      if (result) {
        let event = {
          id: "query_response_0130",
          steps: [
            ["reverseDir", "evLine", "QueryResponseIcon", `Status: ${result == 1.0 ? "Charging" : "Not Charging"}`]
          ]
        };
        // Wait for any active animation (like the request) to finish
        while (eventAnimationActiveRef.current) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        runAnimationEvent(event);
      }
    }
    if ((currentHour == 2 && currentMinute == 30) || (currentHour == 9 && currentMinute == 10) || (currentHour == 17 && currentMinute == 10)) {
      updateDeviceModuleStatus("ev-charger", "ev_control:ExecuteEvent(4) -> GetBatteryStatus()");
      updateDeviceWorkInfo("ev-charger", "ExecuteEvent(4) -> GetBatteryStatus()", `${currentHour}:${currentMinute}`);
      const result = await execute("693ff67e75d1501dc7e8fb4f", "ev-charger", { "param0": 4, "param1": currentHour, "param2": currentMinute, "param3": 1 });
      if (result) {
        let event = {
          id: `query_response_${currentHour}${currentMinute}`,
          steps: [
            ["reverseDir", "evLine", "QueryResponseIcon", `Battery: ${result} kWh`]
          ]
        };
        // Wait for any active animation (like the request) to finish
        while (eventAnimationActiveRef.current) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        runAnimationEvent(event);
      }
    }
    if ((currentHour == 5 && currentMinute == 10) || (currentHour == 22 && currentMinute == 10)) {
      updateDeviceModuleStatus(FREEZER, "freezer_module:ExecuteEvent(6) -> get_consumed_energy()");
      updateDeviceWorkInfo(FREEZER, "ExecuteEvent(6) -> get_consumed_energy()", `${currentHour}:${currentMinute}`);
      const result = await execute("694000ff75d1501dc7e90594", FREEZER, { "param0": 6, "param1": currentHour, "param2": currentMinute });
      if (result) {
        let event = {
          id: `query_response_${currentHour}${currentMinute}`,
          steps: [
            ["reverseDir", "freezerLine", "QueryResponseIcon", `Total Consumed Energy: ${result} kWh`]
          ]
        };
        // Wait for any active animation (like the request) to finish
        while (eventAnimationActiveRef.current) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        runAnimationEvent(event);
      }
    }

    if ((currentHour == 13 && currentMinute == 10) || (currentHour == 22 && currentMinute == 10)) {
      updateDeviceModuleStatus("washing-machine", "wm_module:ExecuteEvent(4) -> get_consumed_energy()");
      updateDeviceWorkInfo("washing-machine", "ExecuteEvent(4) -> get_consumed_energy()", `${currentHour}:${currentMinute}`);
      const result = await execute("69407c4e75d1501dc7e97f59", "washing-machine", { "param0": 4, "param1": currentHour, "param2": currentMinute });
      if (result) {
        let event = {
          id: `query_response_${currentHour}${currentMinute}`,
          steps: [
            ["reverseDir", "wmLine", "QueryResponseIcon", `Total Consumed Energy: ${result} kWh`]
          ]
        };
        // Wait for any active animation (like the request) to finish
        while (eventAnimationActiveRef.current) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        runAnimationEvent(event);
      }
    }
  }

  useEffect(() => {
    if (eventAnimationActive || isPausedRef.current) return;

    const currentDate = new Date(demoTime);
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    ANIMATION_EVENT_SEQUENCE.forEach((event) => {
      if (event.hour === currentHour && event.minute === currentMinute) {
        runAnimationEvent(event);
      }
    });
    runQueryAnimations();
  }, [demoTime]);

  return (
    <>
      <style>
        {`
          @keyframes reverseDir {
            to { stroke-dashoffset: 16; }
          }
          @keyframes normalDir {
            to { stroke-dashoffset: -16; }
          }
          /* Animate the moving icon */
          @keyframes moveAlongDB {
            0% {
              transform: translate(10%, 0px);
            }
            100% {
              transform: translate(90%, 0px);
            }
          }
          @keyframes moveAlongFreezer {
            0% {
              transform: translate(25%, 8px);
            }
            100% {
              transform: translate(-80%, 196px);
            }
          }
          @keyframes moveAlongIC {
            0% {
              transform: translate(10%, 5px);
            }
            100% {
              transform: translate(80%, 5px);
            }
          }
          @keyframes moveAlongEV {
            0% {
              transform: translate(58%, 8px);
            }
            100% {
              transform: translate(155%, 196px);
            }
          }
          @keyframes moveAlongWM {
            0% {
              transform: translate(40%, 8px);
            }
            100% {
              transform: translate(40%, 196px);
            }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes followPath {
            0% {
              offset-distance: 0%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              offset-distance: 100%;
              opacity: 0;
            }
          }
          @keyframes drawPath {
            0% {
              stroke-dashoffset: 100;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0;
            }
          }
        `}
      </style>
      <Box p={4} pt={6} bgcolor="#fcf3f7" width="100%" minHeight="700px" position="relative">
        {/* Server-side */}
        <Grid container justifyContent="center" alignItems="center" spacing={1}>
          <Grid item sx={{ pr: 0 }}>
            <img src={DatabaseImg} alt="MongoDB Database" style={{ width: 120, height: 120, objectFit: "contain", verticalAlign: 'middle' }} />
          </Grid>
          <Grid item sx={{ px: 0, mx: -2, zIndex: 2, display: 'flex', alignItems: 'center' }}>
            <svg width="150px" height="64px" style={{ display: 'block', position: 'relative', zIndex: 2 }}>
              <defs>
                <marker
                  id="arrowheadLeft"
                  markerWidth="7"
                  markerHeight="7"
                  refX="7"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="7 0, 7 7, 0 3.5" fill="#094C7A" />
                </marker>
                <marker
                  id="arrowheadRight"
                  markerWidth="7"
                  markerHeight="7"
                  refX="5.5"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 7 3.5, 0 7" fill="#094C7A" />
                </marker>
              </defs>
              <line
                x1="11"
                y1="17"
                x2="140"
                y2="17"
                stroke="#094C7A"
                strokeWidth="1.5"
                strokeDasharray={animateLines.dbLine.active ? "8 8" : "0"}
                style={{
                  animation: animateLines.dbLine.active ? `${animateLines.dbLine.direction} 1s linear infinite` : "none"
                }}
                markerStart="url(#arrowheadLeft)"
                markerEnd="url(#arrowheadRight)"
              />
              <text
                x="75"
                y="10"
                textAnchor="middle"
                fontSize="9"
                fill="#094C7A"
                fontFamily="monospace"
              >
                Reads/Writes data
              </text>
              {animateLines.dbLine.active && (
                <g
                  key={animateLines.dbLine.runId}
                  style={{
                    animation: "moveAlongDB 2s linear",
                    animationDirection: animateLines.dbLine.direction === "normalDir" ? "normal" : "reverse",
                    animationPlayState: isPaused ? "paused" : "running"
                  }}
                >
                  <circle cx="0" cy="17" r="8" fill="#00bcd4" />
                </g>
              )}
            </svg>
          </Grid>
          <Grid item sx={{ pl: 0, position: 'relative' }}>
            <Box
              sx={{
                p: 2,
                bgcolor: '#888888',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 3,
                boxShadow: 3,
                position: 'relative',
                overflow: 'visible',
                minHeight: 170,
              }}
            >
              {/* --- Loading overlay --- */}
              {loading && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    borderRadius: 3,
                  }}
                >
                  <CircularProgress size={40} sx={{ color: '#fff' }} />
                </Box>
              )}
              <img
                src={OrchestratorImg}
                alt="Orchestrator"
                style={{
                  width: '90%',
                  maxWidth: 80,
                  height: 'auto',
                  objectFit: 'contain',
                  marginBottom: 8,
                }}
              />
              <Typography align="center" color="#fff">
                Orchestrator
              </Typography>

              {/* ===== ARROWS FROM ORCHESTRATOR TO SUPERVISORS ===== */}
              <svg
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  pointerEvents: "none",
                  margin: 0,
                  padding: 0,
                  overflow: "visible"
                }}
              >
                <defs>
                  {/* Arrowhead pointing right (for the line END) */}
                  <marker
                    id="arrowheadRight"
                    markerWidth="7"
                    markerHeight="7"
                    refX="7"
                    refY="3.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <polygon points="0 0, 7 3.5, 0 7" fill="#094C7A" />
                  </marker>

                  {/* Arrowhead pointing left (for the line START) */}
                  <marker
                    id="arrowheadLeft"
                    markerWidth="7"
                    markerHeight="7"
                    refX="0"
                    refY="3.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <polygon points="7 0, 7 7, 0 3.5" fill="#094C7A" />
                  </marker>
                </defs>

                <line
                  x1="42%"
                  y1="8"
                  x2="-60%"
                  y2="199"
                  stroke="#094C7A"
                  strokeWidth="1.5"
                  strokeDasharray={animateLines.freezerLine.active ? "8 8" : "0"}
                  style={{
                    animation: animateLines.freezerLine.active ? `${animateLines.freezerLine.direction} 1s linear infinite` : "none"
                  }}
                  markerStart="url(#arrowheadLeft)"
                  markerEnd="url(#arrowheadRight)"
                />
                {animateLines.freezerLine.active && (
                  <g
                    key={animateLines.freezerLine.runId}
                    style={{
                      animation: "moveAlongFreezer 3s linear forwards",
                      animationDirection: animateLines.freezerLine.direction === "normalDir" ? "normal" : "reverse",
                      animationPlayState: isPaused ? "paused" : "running"
                    }}
                  >
                    <image
                      href={iconMap[animateLines.freezerLine.icon]}
                      width="30"
                      height="30"
                    />
                    <text
                      x="30"
                      y="25"
                      fontSize="10"
                      fill="#094C7A"
                      fontFamily="monospace"
                    >
                      {animateLines.freezerLine.eventMsg}
                    </text>
                  </g>
                )}
                <line
                  x1="50%"
                  y1="9"
                  x2="50%"
                  y2="199"
                  stroke="#094C7A"
                  strokeWidth="1.5"
                  strokeDasharray={animateLines.wmLine.active ? "8 8" : "0"}  // dashed when animateLines=true
                  style={{
                    animation: animateLines.wmLine.active ? `${animateLines.wmLine.direction} 1s linear infinite` : "none"
                  }}
                  markerStart="url(#arrowheadLeft)"
                  markerEnd="url(#arrowheadRight)"
                />
                {animateLines.wmLine.active && (
                  <g
                    key={animateLines.wmLine.runId}
                    style={{
                      animation: "moveAlongWM 2s linear forwards",
                      animationDirection: animateLines.wmLine.direction === "normalDir" ? "normal" : "reverse",
                      animationPlayState: isPaused ? "paused" : "running",
                    }}
                  >
                    <image

                      href={iconMap[animateLines.wmLine.icon]}
                      width="30"
                      height="30"
                    />
                    <text
                      x="30"
                      y="25"
                      fontSize="10"
                      fill="#094C7A"
                      fontFamily="monospace"
                    >
                      {animateLines.wmLine.eventMsg}
                    </text>
                  </g>
                )}
                <line
                  x1="58%"
                  y1="8"
                  x2="155%"
                  y2="199"
                  stroke="#094C7A"
                  strokeWidth="1.5"
                  strokeDasharray={animateLines.evLine.active ? "8 8" : "0"}  // dashed when animateLines=true
                  style={{
                    animation: animateLines.evLine.active ? `${animateLines.evLine.direction} 1s linear infinite` : "none"
                  }}
                  markerStart="url(#arrowheadLeft)"
                  markerEnd="url(#arrowheadRight)"
                />
                {animateLines.evLine.active && (
                  <g
                    key={animateLines.evLine.runId}
                    style={{
                      animation: "moveAlongEV 2s linear forwards",
                      animationDirection: animateLines.evLine.direction === "normalDir" ? "normal" : "reverse",
                      animationPlayState: isPaused ? "paused" : "running",
                    }}
                  >
                    <image
                      href={iconMap[animateLines.evLine.icon]}
                      width="30"
                      height="30"
                    />
                    <text
                      x="30"
                      y="25"
                      fontSize="10"
                      fill="#094C7A"
                      fontFamily="monospace"
                    >
                      {animateLines.evLine.eventMsg}
                    </text>
                  </g>
                )}
              </svg>
              {expanded && modules && (
                <>
                  <Typography color="#fff" align="left" sx={{ mt: 1 }}>
                    Modules:
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      bgcolor: '#f6f6f6',
                      width: '100%',
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      fontFamily="monospace"
                    >
                      {
                        modules.slice(0, 2).map((mod, index) => (
                          <React.Fragment key={index}>
                            {mod.name}
                            <br />
                          </React.Fragment>
                        ))
                      }
                    </Typography>
                  </Box>
                </>
              )}
              {expanded && deployments && (
                <>
                  <Typography color="#fff" sx={{ mt: 1 }}>
                    Deployments:
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      bgcolor: '#f6f6f6',
                      width: '100%',
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      fontFamily="monospace"
                    >
                      {
                        deployments.slice(0, 2).map((mod, index) => (
                          <React.Fragment key={index}>
                            {mod.name}
                            <br />
                          </React.Fragment>
                        ))
                      }
                    </Typography>
                  </Box>
                </>
              )}
              {expanded && (modules.length > 2 || deployments.length > 2) && (
                <Typography
                  onClick={() => setOpenOrchestratorDialog(true)}
                  sx={{
                    mt: 1,
                    color: "#00bcd4",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "0.9rem",
                    alignSelf: "flex-end",
                  }}
                >
                  See More
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={() => (modules || deployments) && setExpanded((e) => !e)}
                disabled={!(modules || deployments)}
                sx={{
                  mt: 1,
                  color: (modules || deployments) ? '#fff' : '#aaa',
                  background: 'transparent',
                  alignSelf: 'center',
                }}
              >
                <ExpandMoreIcon
                  style={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </IconButton>
              {/* --- See More Dialog --- */}
              <Dialog
                open={openOrchestratorDialog}
                onClose={() => setOpenOrchestratorDialog(false)}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>Modules & Deployments</DialogTitle>
                <DialogContent dividers>
                  <Typography variant="h6" gutterBottom>Modules</Typography>
                  {modules.map((mod, index) => (
                    <Accordion
                      key={mod._id}
                      onChange={(e, expanded) => handleAccordionChange('module', mod._id, expanded)}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`module-content-${index}`}
                        id={`module-header-${index}`}
                      >
                        <Typography>{mod.name || mod}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography component="pre" variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                          {detailsCache[mod._id] ? JSON.stringify(detailsCache[mod._id], null, 2) : 'Loading...'}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}

                  <Typography variant="h6" gutterBottom mt="20px">Deployments</Typography>
                  {deployments.map((dep, index) => (
                    <Accordion
                      key={index}
                      onChange={(e, expanded) => handleAccordionChange('deployment', dep._id, expanded)}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`module-content-${index}`}
                        id={`module-header-${index}`}
                      >
                        <Typography>{dep.name || mod}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography component="pre" variant="body2" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap' }}>
                          {detailsCache[dep._id] ? JSON.stringify(detailsCache[dep._id], null, 2) : 'Loading...'}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenOrchestratorDialog(false)}>Close</Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Grid>
          <Grid item sx={{ px: 0, mx: -2, zIndex: 2, display: 'flex', alignItems: 'center' }}>
            <svg width="150px" height="64px" style={{ display: 'block', position: 'relative', zIndex: 2 }}>
              <defs>
                <marker
                  id="arrowheadLeft"
                  markerWidth="7"
                  markerHeight="7"
                  refX="7"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="7 0, 7 7, 0 3.5" fill="#094C7A" />
                </marker>
                <marker
                  id="arrowheadRight"
                  markerWidth="7"
                  markerHeight="7"
                  refX="5.5"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 7 3.5, 0 7" fill="#094C7A" />
                </marker>
              </defs>
              <line
                x1="18"
                y1="17"
                x2="140"
                y2="17"
                stroke="#094C7A"
                strokeWidth="1.5"
                strokeDasharray={animateLines.icLine.active ? "8 8" : "0"}
                style={{
                  animation: animateLines.icLine.active ? `${animateLines.icLine.direction} 1s linear infinite` : "none"
                }}
                markerStart="url(#arrowheadLeft)"
                markerEnd="url(#arrowheadRight)"
              />
              <text
                x="75"
                y="-10"
                textAnchor="middle"
                fontSize="9"
                fill="#094C7A"
                fontFamily="monospace"
              >
                <tspan x="75" dy="24">Receives instructions</tspan>
                <tspan x="75" dy="12">for deployment</tspan>
                <tspan x="75" dy="12">and execution</tspan>

              </text>
              {animateLines.icLine.active && (
                <g
                  key={animateLines.icLine.runId}
                  style={{
                    animation: "moveAlongIC 2s linear forwards",
                    animationDirection: animateLines.icLine.direction === "normalDir" ? "normal" : "reverse",
                    animationPlayState: isPausedRef.current ? "paused" : "running",
                  }}
                >
                  <image
                    href={iconMap[animateLines.icLine.icon]}
                    width="30"
                    height="30"
                  />
                  <text
                    x="30"
                    y="25"
                    fontSize="10"
                    fill="#094C7A"
                    fontFamily="monospace"
                  >
                    {animateLines.icLine.eventMsg}
                  </text>
                </g>
              )}
            </svg>
          </Grid>
          <Grid item>
            <img src={IntelligenceControlImg} alt="Intelligence Control" style={{ width: 120, height: 120, objectFit: "contain" }} />
          </Grid>
        </Grid>

        {/* Supervisors Section */}
        <Box mt={16} px={8} sx={{ border: 2, borderColor: '#c7c7c7', pt: 2, pb: 6, pl: 2, bgcolor: '#f7f7f7' }}>
          <Typography sx={{ mb: 4 }}>Supervisors</Typography>
          <Grid pl={4} container spacing={4} justifyContent="center">
            <Grid item>
              <Tooltip
                title={
                  deviceWorkInfo["freezer"].length > 0 ? (
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, textDecoration: 'underline' }}>Executed Deployments:</Typography>
                      {deviceWorkInfo["freezer"].map((info, index) => (
                        <Typography key={index} variant="caption" display="block">
                          {info.module} — <span style={{ color: "#ddd" }}>{info.time}</span>
                        </Typography>
                      ))}
                    </Box>
                  ) : ""
                }
                arrow
                placement="right"
              >
                <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'pointer' }}>
                  {showHourglass && (
                    <HourglassFullIcon
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        fontSize: 20,
                        animation: demoRunning ? 'spin 2s linear infinite' : 'none',
                        opacity: 0.8
                      }}
                    />
                  )}
                  {/* Animated Arrow Loop */}
                  {activeDeployments["freezer"] && (
                    <svg width="60" height="30" style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', overflow: 'visible' }}>
                      <path
                        d="M 10 0 Q 30 40 50 0"
                        fill="none"
                        stroke="#1b7f9dff"
                        strokeWidth="3"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                        style={{
                          animation: "drawPath 1s linear infinite"
                        }}
                      />
                      <polygon
                        points="-5,-5 5,0 -5,5"
                        fill="#1b7f9dff"
                        style={{
                          offsetPath: "path('M 10 0 Q 30 40 50 0')",
                          offsetRotate: "auto",
                          animation: "followPath 1s linear infinite"
                        }}
                      />
                      <text x="30" y="32" textAnchor="middle" fontSize="12" fill="#1b7f9dff">
                        Executes deployment
                      </text>
                    </svg>
                  )}
                  <Typography align="center" sx={{ mb: 1 }}>freezer</Typography>
                  <img src={FreezerImg} alt="Freezer" style={{ width: 60, height: 60 }} />
                  <img
                    src={isFreezerActive ? activeIcon : inactiveIcon}
                    alt={isFreezerActive ? "active" : "inactive"}
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      width: "20%",
                      zIndex: 2
                    }}
                  />
                  {deviceWorkInfo["freezer"]?.length > 0 && (
                    <Typography variant="caption" sx={{ mt: 1, bgcolor: 'rgba(0,0,0,0.2)', px: 1, borderRadius: 1 }}>
                      {deviceWorkInfo["freezer"].length} Deployment(s)
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip
                title={
                  deviceWorkInfo["washing-machine"].length > 0 ? (
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, textDecoration: 'underline' }}>Executed Deployments:</Typography>
                      {deviceWorkInfo["washing-machine"].map((info, index) => (
                        <Typography key={index} variant="caption" display="block">
                          {info.module} — <span style={{ color: "#ddd" }}>{info.time}</span>
                        </Typography>
                      ))}
                    </Box>
                  ) : ""
                }
                arrow
                placement="right"
              >
                <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'pointer' }}>
                  {showHourglass && (
                    <HourglassFullIcon
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        fontSize: 20,
                        animation: demoRunning ? 'spin 2s linear infinite' : 'none',
                        opacity: 0.8
                      }}
                    />
                  )}
                  {/* Animated Arrow Loop */}
                  {activeDeployments["washing-machine"] && (
                    <svg width="60" height="45" style={{ position: 'absolute', bottom: '-45px', left: '50%', transform: 'translateX(-50%)', overflow: 'visible' }}>
                      <path
                        d="M 10 0 Q 30 40 50 0"
                        fill="none"
                        stroke="#1b7f9dff"
                        strokeWidth="3"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                        style={{
                          animation: "drawPath 2s linear infinite"
                        }}
                      />
                      <polygon
                        points="-5,-5 5,0 -5,5"
                        fill="#1b7f9dff"
                        style={{
                          offsetPath: "path('M 10 0 Q 30 40 50 0')",
                          offsetRotate: "auto",
                          animation: "followPath 2s linear infinite"
                        }}
                      />
                      <text x="30" y="32" textAnchor="middle" fontSize="12" fill="#1b7f9dff">
                        Executes deployment
                      </text>
                    </svg>
                  )}
                  <Typography align="center" sx={{ mb: 1 }}>washing-machine</Typography>
                  <img src={WashingMachineImg} alt="Washing Machine" style={{ width: 60, height: 60 }} />
                  <img
                    src={isWMActive ? activeIcon : inactiveIcon}
                    alt={isWMActive ? "active" : "inactive"}
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      width: "14%",
                      zIndex: 2
                    }}
                  />
                  {deviceWorkInfo["washing-machine"]?.length > 0 && (
                    <Typography variant="caption" sx={{ mt: 1, bgcolor: 'rgba(0,0,0,0.2)', px: 1, borderRadius: 1 }}>
                      {deviceWorkInfo["washing-machine"].length} Deployment(s)
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip
                title={
                  deviceWorkInfo["ev-charger"].length > 0 ? (
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, textDecoration: 'underline' }}>Executed Deployments:</Typography>
                      {deviceWorkInfo["ev-charger"].map((info, index) => (
                        <Typography key={index} variant="caption" display="block">
                          {info.module} — <span style={{ color: "#ddd" }}>{info.time}</span>
                        </Typography>
                      ))}
                    </Box>
                  ) : ""
                }
                arrow
                placement="right"
              >
                <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'pointer' }}>
                  {showHourglass && (
                    <HourglassFullIcon
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        fontSize: 20,
                        animation: demoRunning ? 'spin 2s linear infinite' : 'none',
                        opacity: 0.8
                      }}
                    />
                  )}
                  {/* Animated Arrow Loop */}
                  {activeDeployments["ev-charger"] && (
                    <svg width="60" height="45" style={{ position: 'absolute', bottom: '-45px', left: '50%', transform: 'translateX(-50%)', overflow: 'visible' }}>
                      <path
                        d="M 10 0 Q 30 40 50 0"
                        fill="none"
                        stroke="#1b7f9dff"
                        strokeWidth="3"
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                        style={{
                          animation: "drawPath 2s linear infinite"
                        }}
                      />
                      <polygon
                        points="-5,-5 5,0 -5,5"
                        fill="#1b7f9dff"
                        style={{
                          offsetPath: "path('M 10 0 Q 30 40 50 0')",
                          offsetRotate: "auto",
                          animation: "followPath 2s linear infinite"
                        }}
                      />
                      <text x="30" y="32" textAnchor="middle" fontSize="12" fill="#1b7f9dff">
                        Executes deployment
                      </text>
                    </svg>
                  )}
                  <Typography align="center" sx={{ mb: 1 }}>ev-charger</Typography>
                  <img src={EVChargerImg} alt="EV Charger" style={{ width: 60, height: 60 }} />
                  <img
                    src={isEVActive ? activeIcon : inactiveIcon}
                    alt={isEVActive ? "active" : "inactive"}
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      width: "18%",
                      zIndex: 2
                    }}
                  />
                  {deviceWorkInfo["ev-charger"]?.length > 0 && (
                    <Typography variant="caption" sx={{ mt: 1, bgcolor: 'rgba(0,0,0,0.2)', px: 1, borderRadius: 1 }}>
                      {deviceWorkInfo["ev-charger"].length} Deployment(s)
                    </Typography>
                  )}
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}