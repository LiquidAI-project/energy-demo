// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useState, useEffect } from "react";
import { Box } from "@mui/material";

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
    const [demoTime, setDemoTime] = useState(new Date().setMinutes(0, 0));
    const [demoPassedHours, setDmoPassedHours] = useState(0);
    const demoTimeDateObj = new Date(demoTime);
    const [demoPassedMinutes, setDemoPassedMinutes] = useState(0);

    const [isPaused, setIsPaused] = useState(true);

    // Default speed 1 hour per 10 seconds
    const [speed, setSpeed] = useState(10000 / 6);

    // Time runs from demo start from 24 hours
    // speed depends on selected time value
    useEffect(() => {
        let intervalId;

        if (!isPaused) {
            intervalId = setInterval(() => {
                setSpeed(speed);
                // Increase hours while passed hours are low enough
                if (demoPassedHours < 24) {
                    const newDemoTime = new Date(demoTime);
                    if (demoPassedMinutes >= 50) {
                        setDemoPassedMinutes(0);
                        setDmoPassedHours(demoPassedHours + 1);
                        setDemoTime(
                            newDemoTime.setHours(newDemoTime.getHours() + 1)
                        );
                    } else {
                        // Increase passed minutes by ten
                        const newPassedMinutes = demoPassedMinutes + 10;
                        setDemoPassedMinutes(newPassedMinutes);
                    }
                } else {
                    // stop the interval when demoPassedHours reaches 24
                    setIsPaused(true);
                }
            }, speed);
        }

        return () => clearInterval(intervalId);
    }, [isPaused, speed, demoTime, demoPassedHours, demoPassedMinutes]);

    /**
     * Handles the start of the demo time.
     */
    const handleDemoTimeStart = () => {
        setIsPaused(false);
    };

    return (
        <Box>
            <Box>
                <Box id="demotimebox">
                    <b style={{ fontWeight: "normal" }}>Demo time:</b>{" "}
                    {String(demoTimeDateObj.getHours()).padStart(2, "0")}:
                    {String(demoPassedMinutes).padStart(2, "0")},{" "}
                    {getDayName(demoTimeDateObj)} {demoTimeDateObj.getDate()}.
                    {demoTimeDateObj.getMonth() + 1}. &#x1F4C5;
                </Box>
            </Box>
        </Box>
    );
}

export default DemoClock;
