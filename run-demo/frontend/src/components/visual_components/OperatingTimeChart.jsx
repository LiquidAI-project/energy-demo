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

// Merge slots: prioritize dayPlans over historical
const mergeSlots = (historicalSlots, currentSlots) => {
  const merged = [];

  // Add historical slots first
  historicalSlots.forEach((slot) => {
    // Check if current slots have same time
    const isOverridden = currentSlots.some(
      (c) => c.start === slot.start && c.end === slot.end
    );
    if (!isOverridden) {
      merged.push({ ...slot, type: "historical" });
    }
  });

  // Add current slots (always win)
  currentSlots.forEach((slot) => {
    merged.push({ ...slot, type: "current" });
  });

  return merged;
};

const OperatingTimeChart = () => {
  const { dayPlans, historicalDayPlans } = useDemoVisualizationContext();
  const { demoTime } = useDemoControlContext();
  const chartWidth = "100%";
  const hourWidth = 100 / 24;

  // Calculate the position of the current demo time (red line)
  const demoTimePosition =
    (new Date(demoTime).getHours() / 24) * 100 +
    (new Date(demoTime).getMinutes() / 60) * (100 / 24);

  // Render the dayPlans with slots
  const renderDeviceRows = dayPlans.map((devicePlan, index) => {
    // Historical plan for this device (if exists)
    const historicalSlotsForDevice = historicalDayPlans
    .map((plan) => plan[index])
    .filter(Boolean)
    .flatMap((devicePlan) => devicePlan.slots);

    const mergedSlots = mergeSlots(historicalSlotsForDevice, devicePlan.slots);

    const renderSlots = mergedSlots.map((slot, slotIndex) => {
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
            backgroundColor: slot.type === "current" ? "#1976d2" : "#b0bec5",
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
        <Box sx={{ position: "relative", width: chartWidth }}>
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
      <Typography variant="h9" gutterBottom sx={{ fontWeight: "bold" }}>
        Device Schedule
      </Typography>
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
            width: "90px"
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
          {renderDeviceRows}

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
            {[...Array(23).keys()].map((hour) => (
              <div
                key={hour}
                style={{
                  position: "absolute",
                  left: `${(hour / 23) * 100}%`,
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
                    left:`${((hour - 0.5) / 24) * 100}%`, // center others
                  }}
                >
                  {hour}
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