// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useDemoControlContext } from "../context/demoControlContext/useDemoControlContext";

function getDayName(date) {
    var days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    var dayName = days[date.getDay()];
    return dayName;
}

function DemoClock() {

    const { demoRunning, demoTime, setDemoRunning, setDemoTime } =
      useDemoControlContext();

    // Default speed 1 hour per 10 seconds
    const [speed, setSpeed] = useState(10000 / 6);

    // Time runs from demo start from 24 hours
    // speed depends on selected time value
    useEffect(() => {
        let intervalId;

        if (demoRunning || new Date(demoTime).getMinutes() >= 50) {
            intervalId = setInterval(() => {
                setSpeed(speed);
                // Increase hours while passed hours are low enough
                if (new Date(demoTime).getHours() < 24) {
                    const newDemoTime = new Date(demoTime);
                    if (new Date(demoTime).getMinutes() >= 50) {
                        setDemoTime(
                            newDemoTime.setHours(newDemoTime.getHours() + 1)
                        );
                        setDemoTime(newDemoTime.setMinutes(0));
                    } else {
                        // Increase passed minutes by ten
                        const newPassedMinutes = new Date(demoTime).getMinutes() + 10;
                        setDemoTime(newDemoTime.setMinutes(newPassedMinutes));
                    }
                } else {
                    // stop the interval when demoPassedHours reaches 24
                    setDemoRunning(false);
                }
            }, speed);
        }

        if (demoRunning && new Date(demoTime).getHours() >= 24) {
            setDemoRunning(false);
        }

        return () => clearInterval(intervalId);
    }, [
        demoRunning,
        speed,
        demoTime,
        setDemoRunning,
        setDemoTime,
    ]);

    return (
      <Box>
        <Box>
          <Box id="demotimebox">
            <b style={{ fontWeight: "normal" }}>Demo time:</b>{" "}
            <span
              style={{
                border: demoRunning ? "7px solid red" : "none",
                padding: "2px",
              }}
            >
              {String(new Date(demoTime).getHours()).padStart(2, "0")}:
              {String(new Date(demoTime).getMinutes()).padStart(2, "0")},{" "}
              {getDayName(new Date(demoTime))} {new Date(demoTime).getDate()}.
              {new Date(demoTime).getMonth() + 1}. &#x1F4C5;
            </span>
          </Box>
        </Box>
      </Box>
    );
}

export default DemoClock;
