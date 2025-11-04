//Copyright 2025 Tampere Unievrsity 
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Asma Jamil <asma.jamil@tuni.fi>.


import React from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import DatabaseImg from '../../assets/database.png';
import OrchestratorImg from '../../assets/orchestrator.png';
import IntelligenceControlImg from '../../assets/intelligent_control.jpg';
import FreezerImg from '../../assets/freezer.png';
import WashingMachineImg from '../../assets/washing_machine.png';
import EVChargerImg from '../../assets/ev_charger.png';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import { useState, useEffect, useRef } from 'react';
import { fetchData } from '../../services/apiService';
import activeIcon from '../../assets/active.png';
import inactiveIcon from '../../assets/inactive.png';

export default function ArchitectureDiagram({ socketMsg, isPaused }) {
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [modules, setModules] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [animateLines, setAnimateLines] = useState({
    dbLine: false,
    icLine: false,
    freezerLine: false,
    evLine: false,
    wmLine: false,
  });
  const [lineDirection, setLineDirection] = useState(null);
  const [currEventMsg, setCurrEventMsg] = useState(null);
  const devices = JSON.parse(localStorage.getItem('devices') || '[]');
  const [isFreezerActive, setIsFreezerActive] = useState(false);
  const [isWMActive, setIsWMActive] = useState(false);
  const [isEVActive, setIsEVActive] = useState(false);
  const isPausedRef = useRef(isPaused);

  // Helper function to wait until resumed
  const waitUntilResumed = async () => {
    while (isPausedRef.current) {
      await new Promise(resolve => setTimeout(resolve, 300)); // check every 300ms
    }
  };

  const fetchAndSetData = async () => {
    try {
      setLoading(true);
      setExpanded(false);
      setAnimateLines(prev => ({ ...prev, dbLine: true }));
      setLineDirection("toComp"); 
      const modules = await fetchData("/file/module");
      const deployments = await fetchData("/file/manifest");
      if (deployments || modules) {
        // Wait 2 seconds before processing data
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Wait here if paused 🚦
        await waitUntilResumed();

        const moduleNames = Array.isArray(modules)
          ? modules.map(item => item.name)
          : [];
        const deploymentNames = Array.isArray(deployments)
          ? deployments.map(item => item.name)
          : [];

        setModules(moduleNames);
        setDeployments(deploymentNames);

        await new Promise(resolve => setTimeout(resolve, 1300));
        setAnimateLines(prev => ({ ...prev, dbLine: false }));
        setLoading(false);
        setExpanded(true); 
      }
    } catch (error) {
      console.error("Error fetching deployments:", error);
      setLoading(false);
      setAnimateLines(prev => ({ ...prev, dbLine: false }));
    }
  };

  useEffect(() => {
    fetchAndSetData();
    const intervalId = setInterval(fetchAndSetData, 10 * 60 * 1000);
    return() => { clearInterval(intervalId); }
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const handleSocketMsg = async() => {
      if (!socketMsg) return;

      // Skip processing if paused
      if (isPausedRef.current) {
        console.log("⏸ Socket message ignored (paused)");
        return;
      }

      console.log(socketMsg);
      
      if (socketMsg && socketMsg.funcName.includes("thingi_health") && socketMsg.loglevel === "INFO") {
        if(socketMsg.deviceName === "freezer") {
          setAnimateLines(prev => ({ ...prev, freezerLine: true }));
          setCurrEventMsg(prev => socketMsg.message);

          // Wait here if paused 🚦
          await new Promise(resolve => setTimeout(resolve, 2000));
          await waitUntilResumed();
          await new Promise(resolve => setTimeout(resolve, 1500));

          setAnimateLines(prev => ({ ...prev, freezerLine: false }));
          setIsFreezerActive(devices.find(device => device.name === "freezer").isActive);
        }
        if(socketMsg.deviceName === "washing-machine") {
          setAnimateLines(prev => ({ ...prev, wmLine: true }));
          setCurrEventMsg(prev => socketMsg.message);

          // Wait here if paused 🚦
          await new Promise(resolve => setTimeout(resolve, 2000));
          await waitUntilResumed();
          await new Promise(resolve => setTimeout(resolve, 1500));

          setAnimateLines(prev => ({ ...prev, wmLine: false }));
          setIsWMActive(devices.find(device => device.name === "washing-machine").isActive);
        }
        if(socketMsg.deviceName === "ev-charger") {
          setAnimateLines(prev => ({ ...prev, evLine: true }));
          setCurrEventMsg(prev => socketMsg.message);

           // Wait here if paused 🚦
          await new Promise(resolve => setTimeout(resolve, 2000));
          await waitUntilResumed();
          await new Promise(resolve => setTimeout(resolve, 1500));

          setAnimateLines(prev => ({ ...prev, evLine: false }));
          setIsEVActive(devices.find(device => device.name === "ev-charger").isActive);
        }
        if (isFreezerActive)
          setIsFreezerActive(devices.find(device => device.name === "freezer").isActive);
        if (isWMActive)
          setIsWMActive(devices.find(device => device.name === "washing-machine").isActive);
        if (isEVActive)
          setIsEVActive(devices.find(device => device.name === "ev-charger").isActive);

      }
    }
    
    handleSocketMsg();
  }, [socketMsg]);

  return (
    <>
      <style>
        {`
          @keyframes fromComp {
            to { stroke-dashoffset: 16; }
          }
          @keyframes toComp {
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
              transform: translate(42%, 8px);
            }
            100% {
              transform: translate(-60%, 196px);
            }
          }
          @keyframes moveAlongIC {
            0% {
              transform: translate(10%, 0px);
            }
            100% {
              transform: translate(90%, 0px);
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
              transform: translate(50%, 8px);
            }
            100% {
              transform: translate(50%, 196px);
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
          <Grid item sx={{ px: 0, mx: -2, zIndex: 2, display:'flex', alignItems:'center' }}>
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
                strokeDasharray={animateLines.dbLine ? "8 8" : "0"}
                style={{
                  animation: animateLines.dbLine ? `${lineDirection} 1s linear infinite` : "none"
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
              {animateLines.dbLine && (
                <g
                  style={{
                    animation: "moveAlongDB 2s linear",
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

              {/* --- Main content --- */}
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
                  top: "100%", // adjust as needed
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

                {/* Example 3 arrows */}
                <line
                  x1="42%"
                  y1="8"
                  x2="-60%"
                  y2="199"
                  stroke="#094C7A"
                  strokeWidth="1.5"
                  strokeDasharray={animateLines.freezerLine ? "8 8" : "0"}
                  style={{
                    animation: animateLines.freezerLine ? `${lineDirection} 1s linear infinite` : "none"
                  }}
                  markerStart="url(#arrowheadLeft)"
                  markerEnd="url(#arrowheadRight)"
                />
                {animateLines.freezerLine && (
                  <g
                    style={{
                      animation: "moveAlongFreezer 3s linear",
                      animationPlayState: isPaused ? "paused" : "running"
                    }}
                  >
                    <circle cx="0" cy="0" r="8" fill="#00bcd4" />
                    <text
                      x="12"
                      y="4"
                      fontSize="10"
                      fill="#094C7A"
                      fontFamily="monospace"
                    >
                      {currEventMsg}
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
                  strokeDasharray={animateLines.wmLine ? "8 8" : "0"}  // dashed when animateLines=true
                  style={{
                    animation: animateLines.wmLine ? `${lineDirection} 1s linear infinite` : "none"
                  }}
                  markerStart="url(#arrowheadLeft)"
                  markerEnd="url(#arrowheadRight)"
                />
                {animateLines.wmLine && (
                  <g
                    style={{
                      animation: "moveAlongWM 3s linear",
                      animationPlayState: isPaused ? "paused" : "running"
                    }}
                  >
                    <circle cx="0" cy="0" r="8" fill="#00bcd4" />
                    <text
                      x="12"
                      y="4"
                      fontSize="10"
                      fill="#094C7A"
                      fontFamily="monospace"
                    >
                      {currEventMsg}
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
                  strokeDasharray={animateLines.evLine ? "8 8" : "0"}  // dashed when animateLines=true
                  style={{
                    animation: animateLines.evLine ? `${lineDirection} 1s linear infinite` : "none"
                  }}
                  markerStart="url(#arrowheadLeft)"
                  markerEnd="url(#arrowheadRight)"
                />
                { animateLines.evLine && (
                  <g
                    style={{
                      animation: "moveAlongEV 3s linear",
                      animationPlayState: isPaused ? "paused" : "running"
                    }}
                  >
                    <circle cx="0" cy="0" r="8" fill="#00bcd4" />
                    <text
                      x="12" // horizontal offset from the circle
                      y="4"  // vertical alignment
                      fontSize="10"
                      fill="#094C7A"
                      fontFamily="monospace"
                    >
                      {currEventMsg}
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
                        modules.map((mod, index) => (
                          <React.Fragment key={index}>
                            {mod}
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
                        deployments.map((mod, index) => (
                          <React.Fragment key={index}>
                            {mod}
                            <br />
                          </React.Fragment>
                        ))
                      }
                    </Typography>
                  </Box>
                </>
              )}
              <IconButton
                size="small"
                onClick={() => (modules || deployments) && setExpanded((e) => !e)}
                disabled={!(modules || deployments) }
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
            </Box>
          </Grid>
          <Grid item sx={{ px: 0, mx: -2, zIndex: 2, display:'flex', alignItems:'center' }}>
            <svg width="150px" height="64px" style={{ display: 'block', position: 'relative', zIndex: 2 }}>
              <defs>
                <marker
                  id="arrowheadLeft2"
                  markerWidth="7"
                  markerHeight="7"
                  refX="7"
                  refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="7 0, 7 7, 0 3.5" fill="#094C7A" />
                </marker>
              </defs>
              <line
                x1="18"
                y1="17"
                x2="140"
                y2="17"
                stroke="#094C7A"
                strokeWidth="1.5"
                markerStart="url(#arrowheadLeft2)"
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
            </svg>
          </Grid>
          <Grid item>
            <img src={IntelligenceControlImg} alt="Intelligence Control" style={{ width: 120, height: 120, objectFit: "contain" }} />
          </Grid>
        </Grid>
        
        {/* Supervisors Section */}
        <Box mt={20} px={8} sx={{ border: 2, borderColor: '#c7c7c7', p: 2, bgcolor: '#f7f7f7' }}>
          <Typography>Supervisors</Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item>
              <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
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
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
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
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
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
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}