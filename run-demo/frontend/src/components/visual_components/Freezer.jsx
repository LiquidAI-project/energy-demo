import React, { useState, useEffect } from 'react';
import { Popover } from '@mui/material';
import { useNavigate } from "react-router-dom";
import freezerImage from '../../assets/freezer.png';
import activeIcon from '../../assets/active.png';
import inactiveIcon from '../../assets/inactive.png';
import EnergyComponent from '../EnergyComponent';
import { FREEZER } from '../../../constants';
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";
import { useDemoControlContext } from "../../context/demoControlContext/useDemoControlContext";
import { speak } from "../../utils/deviceUtils";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const Freezer = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [blinkState, setBlinkState] = useState(false);
  const { deviceStatus } = useDemoVisualizationContext();
  const {voiceEnabled} = useDemoControlContext();

  const getDeviceStatus = deviceStatus.find((device) => device.deviceName === FREEZER);

  const navigate = useNavigate();

  const component = {
    id: 'freezer',
    name: 'Fridge & Freezer',
    type: 'consumer',
    description: 'Food stays cold in the fridge and freezer.',
    optimize: false,
    isActive:  isActive,
    deviceInfo: deviceInfo,
    supervisorName: getDeviceStatus.supervisorName
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
    const intervalId = setInterval(checkEquipment, 2000);
    return () => clearInterval(intervalId);
  }, [component.id]);

  // Sets blinkState when the appliance is in running state
  useEffect(() => {
    let intervalId;
    if (getDeviceStatus.isEnergyIntensive) {
      if(voiceEnabled)
        speak("Freezer is turned on");
      intervalId = setInterval(() => {
        setBlinkState((prevState) => !prevState);
      }, 500);
    } else {
      if(voiceEnabled)
        speak("Freezer is turned off");
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
          top: "9.5%",
          left: "63.8%",
          width: "6%",
          height: "10%",
          backgroundColor: "transparent",
          border: "none",
          padding: "0%",
          zIndex: 2,
        }}
        onClick={handleClick}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <img
            id="freezer"
            src={freezerImage}
            alt="freezer"
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
          top: "5%",
          left: "65.8%",
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
        onClose={handleHoverAway}
        disableRestoreFocus
      >
        <EnergyComponent {...component} />
      </Popover>
    </div>
  );
});

Freezer.displayName = 'Freezer';
export default Freezer;
