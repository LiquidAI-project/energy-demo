import React, { useState } from 'react';
import { Popover } from "@mui/material";
import carImage from "../../assets/car.png";
import EnergyComponent from "../EnergyComponent";

const ElectricCar1 = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  const component = {
    id: "ElectricCar1",
    name: "ElectricCar1",
    type: "consumer",
    description: "Electric car is charged at the charging station.",
    optimize: false,
    isActive:  isActive,
    deviceInfo: deviceInfo,
  };

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
            top: "55.9%",
            left: "71.5%",
            width: "10%",
            height: "27%",
            backgroundColor: "transparent",
            border: "none",
            padding: "0%",
          }}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      >
        <img
          id="electric-car-1"
          src={carImage}
          alt="ElectricCar1"
          ref={ref}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </button>
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

ElectricCar1.displayName = "ElectricCar1";
export default ElectricCar1;
