import React, { useState, useEffect } from 'react';
import { Popover } from "@mui/material";
import washingMachineImage from "../../assets/washing_machine.png";
import activeIcon from "../../assets/active.png";
import inactiveIcon from '../../assets/inactive.png';
import EnergyComponent from "../EnergyComponent";
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";

const WashingMachine = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const { washingMachineOn } = useDemoVisualizationContext();

  const component = {
    id: "washingMachine",
    name: "WashingMachine",
    type: "consumer",
    description: "Washing machine turns dirty laundry clean in just a moment.",
    optimize: false,
    isActive:  isActive,
    deviceInfo: deviceInfo,
  };

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

    if (washingMachineOn) {
      intervalId = setInterval(() => {
        setBlinkState(prevState => !prevState);
      }, 500);
    } else {
      setBlinkState(false); 
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [washingMachineOn]);

  const [blinkState, setBlinkState] = useState(false);

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
          top: "23.1%",
          left: "28.6%",
          width: "5%",
          height: "6%",
          backgroundColor: "transparent",
          border: "none",
          padding: "0%",
          zIndex: 2,
        }}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      >
        <img
          id="washing-machine"
          src={washingMachineImage}
          alt="washingMachine"
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
          top: "18.1%",
          left: "28.6%",
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

WashingMachine.displayName = "WashingMachine";
export default WashingMachine;
