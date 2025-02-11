// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { Grid, Typography, Box } from "@mui/material";

// Helper function to calculate the duration in hours
const calculateDurationInHours = (start, end) => {
  return end - start;
};

// Task data with multiple slots (purely hourly)
const tasks = [
  {
    name: "Washing Machine",
    slots: [
      { start: 8, end: 12 }, // 8 AM to 12 PM
      { start: 14, end: 18 }, // 2 PM to 6 PM
    ],
  },
  {
    name: "Freezer",
    slots: [
      { start: 9, end: 17 }, // 9 AM to 5 PM
    ],
  },
  {
    name: "EV charger",
    slots: [
      { start: 10, end: 24 }, // 10 AM to 2 PM
    ],
  },
];

const OperatingTimeChart = () => {
  const chartWidth = "100%";
  const hourWidth = 100 / 24;

  // Render the tasks with slots
  const renderTasks = tasks.map((task, index) => {
    const renderSlots = task.slots.map((slot, slotIndex) => {
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
        key={task.name}
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
        {/* Task names on the left */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            marginRight: 2,
          }}
        >
          {tasks.map((task) => (
            <Typography
              key={task.name}
              variant="body1"
              sx={{ textAlign: "center", marginBottom: 1 }}
            >
              {task.name}
            </Typography>
          ))}
        </Box>

        {/* The Graph for Task Slots */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: chartWidth,
          }}
        >
          {/* Task Rows */}
          <Box sx={{ position: "relative", marginTop: 2 }}>{renderTasks}</Box>

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
