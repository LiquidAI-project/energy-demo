import React, { useState, useEffect } from 'react';
import { Popover } from '@mui/material';
import freezerImage from '../../assets/freezer.png';
import activeIcon from '../../assets/active.png';
import inactiveIcon from '../../assets/inactive.png';
import EnergyComponent from '../EnergyComponent';
import { FREEZER } from '../../../constants';
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";


const Freezer = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [blinkState, setBlinkState] = useState(false);
  const { deviceStatus } = useDemoVisualizationContext();

  const component = {
    id: 'freezer',
    name: 'Fridge & Freezer',
    type: 'consumer',
    description: 'Food stays cold in the fridge and freezer.',
    optimize: false,
    isActive:  isActive,
    deviceInfo: deviceInfo,
  };

  const freezerMaxOn = deviceStatus.find((device) => device.deviceName === FREEZER).isEnergyIntensive;

  useEffect(() => {
    const checkEquipment = () => {
      const devices = JSON.parse(localStorage.getItem('devices') || '[]');
      const deviceFound = devices.find(device => device.name === component.id);
      setIsActive(deviceFound !== undefined);
      setDeviceInfo(deviceFound || {});
    };

    checkEquipment();

    // Set up the interval to check every 2 seconds
    const intervalId = setInterval(checkEquipment, 2000);

    return () => clearInterval(intervalId);
  }, [component.id]);

    useEffect(() => {
      let intervalId;

      if (freezerMaxOn) {
        intervalId = setInterval(() => {
          setBlinkState((prevState) => !prevState);
        }, 500);
      } else {
        setBlinkState(false);
        clearInterval(intervalId);
      }
      return () => clearInterval(intervalId);
    }, [freezerMaxOn]);

  const handleHoverOn = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHoverAway = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
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
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      >
        <img
          id="freezer"
          src={freezerImage}
          alt="freezer"
          ref={ref}
          style={{
            width: "100%",
            height: "100%",
            border: blinkState ? "5px solid red" : "5px solid green",
            borderRadius: "8px",
            transition: "border 0.2s", 
          }}
        />
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
