// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import React, { useState } from 'react';
import { Popover, Tab, Tabs, Box } from '@mui/material';
import { AnimatePresence, motion } from "framer-motion";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import { keyframes } from "@mui/system";
import userControlIcon from '../../assets/userControl.png';
import { useDemoControlContext } from "../../context/demoControlContext/useDemoControlContext";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const UserControlUI = React.forwardRef(({anchorPopOverEl, activePopover, handlePopOverClick, handlePopOverClose}, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const { demoTime, scheduleProcessing } = useDemoControlContext();

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
        onClick={(!(new Date(demoTime).getHours() === 10 && new Date(demoTime).getMinutes() === 0)) ? handleClickOpen : undefined}
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
        {scheduleProcessing && ((new Date(demoTime).getHours() === 10 && new Date(demoTime).getMinutes() === 0)) && (
          <>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              style={{
                position: "absolute",
                padding: "10px",
                bottom: "-4%",    
                right: "-4%",
                width: "18%",       
                height: "30%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(166, 221, 175, 0.85)",
                borderRadius: "50%",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                cursor: "pointer"
              }}
              onClick={(e) => handlePopOverClick(e, "user")}
            >
              <HourglassFullIcon style={{ fontSize: "1.0rem", color: "#167356" }} />
            </motion.div>
            <Popover
              open={activePopover === "user"}
              anchorEl={anchorPopOverEl}
              onClose={handlePopOverClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Box p={2} sx={{ maxWidth: 250 }}>
                <strong>User Control</strong>
                <p>
                  User initiates the scheduling process by requesting the optimal schedules from the Intelligence control.
                </p>
              </Box>
            </Popover>
          </>
        )}
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
            {selectedTab === 0 && <div>TODO: Washing Machine controls</div>}
            {selectedTab === 1 && <div>TODO: Freezer controls</div>}
            {selectedTab === 2 && <div>TODO: EV charge controls</div>}
          </Box>
        </Box>
      </Popover>
    </div>
  );
});

UserControlUI.displayName = "UserControlUI";
export default UserControlUI;
