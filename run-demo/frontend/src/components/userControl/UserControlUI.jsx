// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import React, { useState } from 'react';
import { Popover, Tab, Tabs, Box } from '@mui/material';
import userControlIcon from '../../assets/userControl.png';
import WashinMachineControl from './WashingMachineControl';

const UserControlUI = React.forwardRef((props, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Handle click to open the popover
  const handleClickOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing of the popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <button
        onClick={handleClickOpen}
        ref={ref}
        style={{
          position: "absolute",
          top: "37%",
          left: "20%",
          width: "6%",
          height: "7%",
          zIndex: 2,
          padding: 0,
          background: "transparent",
          border: "none",
        }}
      >
        <img
          src={userControlIcon}
          alt="userControl"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ width: 600 }}>
          <h3 style={{paddingLeft: 10}}>User Control</h3>

          {/* Tab Menu */}
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Washing Machine" />
            <Tab label="Freezer" />
            <Tab label="EV Charger" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ padding: 2 }}>
            {selectedTab === 0 && <WashinMachineControl {...props} />}
            {selectedTab === 1 && <div>TODO: Freezer controls</div>}
            {selectedTab === 2 && <div>TODO: EV charge controls</div>}
          </Box>
        </Box>
      </Popover>
    </div>
  );
});

export default UserControlUI;
