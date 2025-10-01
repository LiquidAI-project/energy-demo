import React, { useState, useEffect } from 'react';
import { Popover } from "@mui/material";
import { useNavigate } from "react-router-dom";
import washingMachineImage from "../../assets/washing_machine.png";
import activeIcon from "../../assets/active.png";
import inactiveIcon from '../../assets/inactive.png';
import EnergyComponent from "../EnergyComponent";
import { WASHING_MACHINE } from '../../../constants';
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";
import { speak } from "../../utils/deviceUtils";

const WashingMachine = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const { deviceStatus } = useDemoVisualizationContext();

  const getDeviceStatus = deviceStatus.find((device) => device.deviceName === WASHING_MACHINE);

  const navigate = useNavigate();

  const component = {
    id: "washingMachine",
    name: "WashingMachine",
    type: "consumer",
    description: "Washing machine turns dirty laundry clean in just a moment.",
    optimize: false,
    isActive:  isActive,
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

  useEffect(() => {
    let intervalId;
    if (getDeviceStatus.isEnergyIntensive) {
      speak("Washing machine is turned on");
      intervalId = setInterval(() => {
        setBlinkState(prevState => !prevState);
      }, 500);
    } else {
      speak("Freezer is turned off");
      setBlinkState(false); 
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [getDeviceStatus.isEnergyIntensive]);

  const [blinkState, setBlinkState] = useState(false);

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
        onClick={handleClick}
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
            border: isActive ? blinkState
            ? "5px solid rgb(34, 195, 34)"
            : "5px solid green"
            : "5px solid red",
            borderRadius: "8px",
            boxShadow: isActive && blinkState
              ? "0 0 12px 6px rgba(34, 195, 34)"
              : "none",
            transition: "all 0.3s ease-in-out",
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
