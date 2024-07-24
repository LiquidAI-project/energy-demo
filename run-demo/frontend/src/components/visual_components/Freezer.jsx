import React, { useState, useEffect } from 'react';
import { Popover } from '@mui/material';
import freezerImage from '../../assets/freezer.png';
import energyBorder from "../../assets/freezer_energy.png";
import activeIcon from '../../assets/active.png';
import inactiveIcon from '../../assets/inactive.png';
import EnergyComponent from '../EnergyComponent';

const Freezer = React.forwardRef((props, ref) => {

  const [anchorEl, setAnchorEl] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const component = {
    id: 'freezer',
    name: 'Fridge & Freezer',
    type: 'consumer',
    description: 'Food stays cold in the fridge and freezer.',
    optimize: false,
    isActive:  isActive,
  };

  useEffect(() => {
    const checkEquipment = () => {
      const devices = JSON.parse(localStorage.getItem('devices') || '[]');
      const isEquipmentActive = devices.some(device => device.name === 'equipment1');
      setIsActive(isEquipmentActive);
    };
  
    checkEquipment();
  
    // Set up the interval to check every 2 seconds
    const intervalId = setInterval(checkEquipment, 2000);
  
    return () => clearInterval(intervalId);
  }, []);

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
        id="freezer-energy"
        src={energyBorder}
        alt="energy"
        className="freezer-energy-border"
        style={{
          position: "absolute",
          top: "9%",
          left: "63.6%",
          width: "4.5%",
          height: "11%",
          opacity: window.sessionStorage.getItem(component.id),
        }}
      />
      <img
        id="freezer"
        src={freezerImage}
        alt="freezer"
        ref={ref}
        style={{
          position: "absolute",
          top: "9.5%",
          left: "63.8%",
          width: "4%",
          height: "10%",
        }}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      />
      <img
        src={isActive ? activeIcon : inactiveIcon}
        alt={isActive ? "active" : "inactive"}
        style={{
          position: "absolute",
          top: "5%",
          left: "63.8%",
          width: "8%",
          height: "10%",
          transform: "scale(0.2)",
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
