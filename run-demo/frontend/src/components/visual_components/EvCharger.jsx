// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import React, { useState, useEffect } from "react";
import { Popover } from "@mui/material";
import { useNavigate } from "react-router-dom";
import activeIcon from "../../assets/active.png";
import inactiveIcon from '../../assets/inactive.png';
import EVChargerIcon from "../../assets/ev_charger.png";
import { EV_CHARGER } from "../../../constants";
import EnergyComponent from "../EnergyComponent";
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";
import { speak } from "../../utils/deviceUtils";

const evCharger = React.forwardRef((props, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const {deviceStatus} = useDemoVisualizationContext();
  const [blinkState, setBlinkState] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  const getDeviceStatus = deviceStatus.find((device) => device.deviceName === EV_CHARGER);

  const navigate = useNavigate();

  const component = {
    id: "evCharger",
    name: "Ev Charger",
    type: "consumer",
    description: "Electric cars are charged at the charging station.",
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
    const intervalId = setInterval(checkEquipment, 5000);
    return () => clearInterval(intervalId);
  }, [component.id]);

  // Sets blinkState when the appliance is in running state
  useEffect(() => {
    let intervalId;
    if (getDeviceStatus.isEnergyIntensive) {
      speak("Electric cars are connected for charging");
      intervalId = setInterval(() => {
        setBlinkState((prevState) => !prevState);
      }, 500);
    } else {
      speak("Electric cars are removed from charging");
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
        <img
          id="evCharger"
          src={EVChargerIcon}
          alt="ecCharger"
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
        onClose={handleHoverAway}
        disableRestoreFocus
      >
        <EnergyComponent {...component} />
      </Popover>
    </div>
  );
});

evCharger.displayName = "evCharger";
export default evCharger;
