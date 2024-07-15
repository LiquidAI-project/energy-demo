import React, { useState } from 'react';
import { Popover } from '@mui/material';
import freezerImage from '../../assets/freezer.png';
import activeIcon from '../../assets/active.png';
import EnergyComponent from '../EnergyComponent';

const Freezer = React.forwardRef((props, ref) => {
  const component = {
    id: 'freezer',
    name: 'Fridge & Freezer',
    type: 'consumer',
    description: 'Food stays cold in the fridge and freezer.',
    optimize: false,
  };

  const [anchorEl, setAnchorEl] = useState(null);

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
        id="freezer"
        src={freezerImage}
        alt="freezer"
        ref={ref}
        style={{
          position: 'absolute',
          top: '9.5%',
          left: '63.8%',
          width: '4%',
          height: '10%',
        }}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverAway}
      />
      <img
        src={activeIcon}
        alt="active"
        style={{
          position: 'absolute',
          top: '5%',
          left: '63.8%',
          width: '8%',
          height: '10%',
          transform: 'scale(0.2)',
        }}
      />
      <Popover
        sx={{ pointerEvents: 'none' }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
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
