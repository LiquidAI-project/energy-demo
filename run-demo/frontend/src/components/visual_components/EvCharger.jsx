// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import React, { useState, useEffect, useRef } from "react";
import { Popover, Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import activeIcon from "../../assets/active.png";
import inactiveIcon from '../../assets/inactive.png';
import EVChargerIcon from "../../assets/ev_charger.png";
import { EV_CHARGER } from "../../../constants";
import EnergyComponent from "../EnergyComponent";
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";
import { useDemoControlContext } from "../../context/demoControlContext/useDemoControlContext";
import { speak } from "../../utils/deviceUtils";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const evCharger = React.forwardRef((props, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { deviceStatus } = useDemoVisualizationContext();
  const { voiceEnabled } = useDemoControlContext();
  const [blinkState, setBlinkState] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const prevValueRef = useRef(null);
  const isFirstMount = useRef(true);

  const getDeviceStatus = deviceStatus.find((device) => device.deviceName === EV_CHARGER);

  const navigate = useNavigate();

  const component = {
    id: "evCharger",
    name: "Ev Charger",
    type: "consumer",
    description: "Electric cars are charged at the charging station.",
    optimize: false,
    isActive: isActive,
    deviceInfo: deviceInfo,
    supervisorName: getDeviceStatus.supervisorName,
    totalCapacity: "120kWh",
    minCapacity: "80kWh"
  };

  useEffect(() => {
    const checkEquipment = () => {
      const devices = JSON.parse(localStorage.getItem('devices') || '[]');
      const deviceFound = devices.find(device => device.name === getDeviceStatus.supervisorName);
      setIsActive(deviceFound && deviceFound.isActive);
      setDeviceInfo(deviceFound || {});
    };
    checkEquipment();
    // Set up the interval to check every 2 seconds
    const intervalId = setInterval(checkEquipment, 5000);
    return () => clearInterval(intervalId);
  }, [component.id]);

  // Sets blinkState when the appliance is in running state
  useEffect(() => {
    let intervalId;
    if (getDeviceStatus.isEnergyIntensive === "abc") {
      intervalId = setInterval(() => {
        setBlinkState(prevState => !prevState);
      }, 500);
    } else {
      setBlinkState(false);
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [getDeviceStatus.isEnergyIntensive]);

  useEffect(() => {
    // Skip the first mount entirely
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevValueRef.current = getDeviceStatus.isEnergyIntensive;
      return; // ✅ don't run anything on first mount
    }
    // Only run if the value actually changed
    if (prevValueRef.current === getDeviceStatus.isEnergyIntensive) return;
    if (getDeviceStatus.isEnergyIntensive) {
      if (voiceEnabled) speak("Electric cars are connected for charging");
    } else {
      if (voiceEnabled) speak("Electric cars are removed from charging");
    }
    prevValueRef.current = getDeviceStatus.isEnergyIntensive;
  }, [getDeviceStatus.isEnergyIntensive, voiceEnabled]);

  const closeTimeoutRef = useRef(null);

  const handleHoverOn = (event) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleHoverAway = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setAnchorEl(null);
    }, 300);
  };

  const handleClick = () =>
    navigate(`/component/${component.id}`, {
      state: { component: component },
      replace: true,
    });

  const open = Boolean(anchorEl);

  return (
    <div>
      <style>
        {`
          @keyframes vibrate {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-1px, -1px); }
            20% { transform: translate(1px, 1px); }
            30% { transform: translate(-1px, 1px); }
            40% { transform: translate(1px, -1px); }
            50% { transform: translate(-1px, -1px); }
            60% { transform: translate(1px, 1px); }
            70% { transform: translate(-1px, 1px); }
            80% { transform: translate(1px, -1px); }
            90% { transform: translate(-1px, -1px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}
      </style>
      <button
        style={{
          position: "absolute",
          top: "52.2%",
          left: "80.35%",
          width: "4%",
          height: "4%",
          backgroundColor: "transparent",
          border: "none",
          borderRadius: "8px",
          transition: "border 0.2s",
          padding: "0%",
          zIndex: 2,
        }}
        onClick={handleClick}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            id="evCharger"
            src={EVChargerIcon}
            alt="ecCharger"
            ref={ref}
            style={{
              width: "100%",
              height: "100%",
              border: isActive ? blinkState
                ? "5px solid #1976d2"
                : "5px solid green"
                : "5px solid red",
              borderRadius: "8px",
              boxShadow: isActive && blinkState ? "0 0 12px 12px #1976d2" : "none",
              transition: "all 0.3s ease-in-out",
              animation: isActive && blinkState ? "vibrate 0.2s ease-in-out infinite" : "none"
            }}
          />
          {/* Overlay */}
          {isActive && blinkState && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.3)", // semi-transparent overlay
                borderRadius: "8px",
              }}
            >
              <PowerSettingsNewIcon
                style={{
                  fontSize: 20,
                  color: "white",
                  animation: "pulse 1s ease-in-out infinite",
                }}
              />
            </div>
          )}
        </div>
      </button>
      <img
        src={isActive ? activeIcon : inactiveIcon}
        alt={isActive ? "active" : "inactive"}
        style={{
          position: "absolute",
          top: "47.5%",
          left: "80%",
          width: "8%",
          height: "10%",
          transform: "scale(0.2)",
          zIndex: 2,
        }}
      />
      <Popover
        sx={{ pointerEvents: "none" }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus
        PaperProps={{
          sx: { pointerEvents: "auto" },
          onMouseEnter: () => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
          },
          onMouseLeave: handleHoverAway,
        }}
      >
        <EnergyComponent {...component}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Electric Car 1
                </Typography>
                <Typography variant="caption" display="block">
                  - Total energy: 120 kWh
                </Typography>
                <Typography variant="caption" display="block">
                  - Min Energy (Req): 80 kWh
                </Typography>
                <Typography variant="caption" display="block">
                  - Energy Discharge: 40 kWh
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Electric Car 2
                </Typography>
                <Typography variant="caption" display="block">
                  - Total energy: 120 kWh
                </Typography>
                <Typography variant="caption" display="block">
                  - Min Energy (Req): 80 kWh
                </Typography>
                <Typography variant="caption" display="block">
                  - Energy Discharge: 40 kWh
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </EnergyComponent>
      </Popover>
    </div>
  );
});

evCharger.displayName = "evCharger";
export default evCharger;
