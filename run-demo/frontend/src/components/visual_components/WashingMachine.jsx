import React, { useState, useEffect } from 'react';
import { Popover } from "@mui/material";
import washingMachineImage from "../../assets/washing_machine.png";
import energyBorder from "../../assets/washing_machine_energy.png";
import activeIcon from "../../assets/active.png";
import inactiveIcon from '../../assets/inactive.png';
import EnergyComponent from "../EnergyComponent";

const WashingMachine = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

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

  const handleHoverOn = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHoverAway = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div>
      <img
        id="washing-machine-energy"
        src={energyBorder}
        alt="energy"
        className="washing-machine-energy-border"
        style={{
          position: "absolute",
          top: "22.8%",
          left: "28.2%",
          width: "4.8%",
          height: "4.8%",
          zIndex: 2,
        }}
      />
      <button
        style={{
          position: "absolute",
          top: "23.1%",
          left: "28.6%",
          width: "4%",
          height: "4%",
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
