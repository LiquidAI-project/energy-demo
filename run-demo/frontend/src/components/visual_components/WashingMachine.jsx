import React, { useState, useEffect, useRef } from 'react';
import { Popover } from "@mui/material";
import { useNavigate } from "react-router-dom";
import washingMachineImage from "../../assets/washing_machine.png";
import activeIcon from "../../assets/active.png";
import inactiveIcon from '../../assets/inactive.png';
import EnergyComponent from "../EnergyComponent";
import { WASHING_MACHINE } from '../../../constants';
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";
import { useDemoControlContext } from "../../context/demoControlContext/useDemoControlContext";
import { speak } from "../../utils/deviceUtils";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const WashingMachine = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [blinkState, setBlinkState] = useState(false);
  const { deviceStatus } = useDemoVisualizationContext();
  const { voiceEnabled } = useDemoControlContext();
  const prevValueRef = useRef(null);
  const isFirstMount = useRef(true);

  const getDeviceStatus = deviceStatus.find((device) => device.deviceName === WASHING_MACHINE);

  const navigate = useNavigate();

  const component = {
    id: "washingMachine",
    name: "WashingMachine",
    type: "consumer",
    description: "Washing machine turns dirty laundry clean in just a moment.",
    optimize: false,
    isActive: isActive,
    deviceInfo: deviceInfo,
    supervisorName: getDeviceStatus.supervisorName
  };


  useEffect(() => {
    const checkEquipment = () => {
      const devices = JSON.parse(localStorage.getItem("devices") || "[]");
      const deviceFound = devices.find(
        (device) => device.name === getDeviceStatus.supervisorName
      );
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
    // Skip the first mount entirely
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevValueRef.current = getDeviceStatus.isEnergyIntensive;
      return; // ✅ don't run anything on first mount
    }
    // Only run if the value actually changed
    if (prevValueRef.current === getDeviceStatus.isEnergyIntensive) return;
    if (getDeviceStatus.isEnergyIntensive) {
      if (voiceEnabled) speak("Washing machine is turned on");
    } else {
      if (voiceEnabled) speak("Washing machine is turned off");
    }
    prevValueRef.current = getDeviceStatus.isEnergyIntensive;
  }, [getDeviceStatus.isEnergyIntensive, voiceEnabled]);

  useEffect(() => {
    let intervalId;
    if (getDeviceStatus.isEnergyIntensive) {
      intervalId = setInterval(() => {
        setBlinkState(prevState => !prevState);
      }, 500);
    } else {
      setBlinkState(false);
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [getDeviceStatus.isEnergyIntensive]);

  const handleHoverOn = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHoverAway = () => {
    setAnchorEl(null);
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
          top: "23.1%",
          left: "28.6%",
          width: "5%",
          height: "6%",
          backgroundColor: "transparent",
          border: "none",
          padding: "0%",
          zIndex: 5,
        }}
        onClick={handleClick}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            id="washing-machine"
            src={washingMachineImage}
            alt="washingMachine"
            ref={ref}
            style={{
              width: "100%",
              height: "100%",
              border: isActive
                ? blinkState
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
                  fontSize: 30,
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
          top: "18.1%",
          left: "29.2%",
          width: "8%",
          height: "10%",
          transform: "scale(0.2)",
          zIndex: 5
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
        onClose={handleHoverAway}
        disableRestoreFocus
      >
        <EnergyComponent {...component} />
      </Popover>
    </div>
  );
});

WashingMachine.displayName = "WashingMachine";
export default WashingMachine;
