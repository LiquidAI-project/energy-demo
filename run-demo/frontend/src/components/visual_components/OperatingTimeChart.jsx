// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { Grid, Typography, Box } from "@mui/material";
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";
import { useDemoControlContext } from "../../context/demoControlContext/useDemoControlContext";

// Helper function to calculate the duration in hours
const calculateDurationInHours = (start, end) => {
  return end - start;
};

const OperatingTimeChart = () => {

  const { dayPlans } = useDemoVisualizationContext();
  const { demoTime } = useDemoControlContext();
  const chartWidth = "100%";
  const hourWidth = 100 / 24;
  
  // Calculate the position of the current demo time (red line)
  const demoTimePosition = (new Date(demoTime).getHours()/ 24) * 100 + (new Date(demoTime).getMinutes() / 60) * (100 / 24);

  // Render the dayPlans with slots
  const renderDayPlans = dayPlans.map((devicePlan, index) => {
    const renderSlots = devicePlan.slots.map((slot, slotIndex) => {
      const taskDuration = calculateDurationInHours(slot.start, slot.end);
      const taskOffset = slot.start * hourWidth;

      return (
        <div
          key={`${index}-${slotIndex}`}
          style={{
            position: "absolute",
            left: `${taskOffset}%`,
            width: `${taskDuration * hourWidth}%`,
            height: "30px",
            backgroundColor: "#1976d2",
            borderRadius: "4px",
          }}
        />
      );
    });

    return (
      <Grid
        item
        xs={12}
        key={devicePlan.name}
        sx={{ position: "relative", marginBottom: 2 }}
      >
        <Box sx={{ padding: 1, position: "relative", width: chartWidth }}>
          <div
            style={{
              position: "relative",
              height: "30px",
              width: "100%",
              backgroundColor: "#f4f4f4",
            }}
          >
            {renderSlots}
          </div>
        </Box>
      </Grid>
    );
  });

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          marginBottom: 2,
        }}
      >
        {/* Device names on the left */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            marginRight: 2,
          }}
        >
          {dayPlans.map((devicePlan) => (
            <Typography
              key={devicePlan.name}
              variant="body1"
              sx={{ textAlign: "center", marginBottom: 1 }}
            >
              {devicePlan.name}
            </Typography>
          ))}
        </Box>

        {/* The Graph for Device Slots */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: chartWidth,
          }}
        >
          {/* Device Rows */}
          <Box sx={{ position: "relative", marginTop: 2 }}>{renderDayPlans}</Box>

          {/* Vertical Grid Lines (X-Axis) */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {[...Array(24).keys()].map((hour) => (
              <div
                key={hour}
                style={{
                  position: "absolute",
                  left: `${(hour / 24) * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: "1px",
                  backgroundColor: "#ddd",
                }}
              />
            ))}
          </Box>

          {/* Red Vertical Line for Demo Time */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: `${demoTimePosition}%`,
              bottom: 0,
              width: "2px",
              backgroundColor: "red",
            }}
          />

          {/* Time labels at the bottom of the graph */}
          <Box sx={{ padding: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {[...Array(24).keys()].map((hour) => (
                <Typography
                  key={hour}
                  variant="body2"
                  sx={{
                    width: `${100 / 24}%`,
                    textAlign: "center",
                    position: "absolute",
                    left: `${((hour + 0.5) / 24) * 100}%`,
                  }}
                >
                  {hour + 1}
                </Typography>
              ))}
            </div>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default OperatingTimeChart;
