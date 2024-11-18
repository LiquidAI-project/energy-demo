import React, { useState } from 'react';
import { Popover } from "@mui/material";
import JacuzziImage from "../../assets/jacuzzi.png";
import EnergyComponent from "../EnergyComponent";

const Jacuzzi = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  const component = {
    id: "Jacuzzi",
    name: "Jacuzzi",
    type: "consumer",
    description: "Jacuzzi has an efficient heating system to warm up the water.",
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
            top: "4%",
            left: "6.7%",
            width: "10%",
            height: "12%",
            backgroundColor: "transparent",
            border: "none",
            padding: "0%",
          }}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      >
        <img
          id="Jacuzzi"
          src={JacuzziImage}
          alt="Jacuzzi"
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

Jacuzzi.displayName = "Jacuzzi";
export default Jacuzzi;
