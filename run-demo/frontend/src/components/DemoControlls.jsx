// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useState, useEffect, useCallback } from "react";
import { Button } from "@mui/material";
import { fetchData,fetchPostData } from "../services/apiService";
import RealtimeClock from "./RealtimeClock";
import DemoClock from "./DemoClock";

// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = process.env.ANIMATION_MOVING_TIME;

const DemoControlls = () => {
    const [demoRunning, setDemoRunning] = useState(false);
    const [demoTime, setDemoTime] = useState(new Date().setMinutes(0, 0));
    const [hourlyQueryCompleted, setHourlyQueryCompleted] = useState(false);

    /**
     * Deploys the wasm module to the specified device.
     * After confirming the deployment status, it pauses for the animation duration
     * and then triggers the run function to start the wasm module on the device.
     *
     * @param {string} module name - Name of the module that needs to be deployed.
     */
    const wasmModuleDeployment = useCallback(
        async (moduleName) => {
            try {
                // Fetch manifest data
                const response = await fetchData("/file/manifest");

                // Find deployment object with name "wm-run"
                const deploymentObj = response.find(
                    (obj) => obj.name === moduleName
                );

                if (!deploymentObj) {
                    console.warn("No deployment found");
                    return;
                }

                console.log(`Processing deployment: ${deploymentObj.name}`);
                const deviceId = deploymentObj.sequence[0]?.device;

                // Post deployment object and process response
                const res = await fetchPostData(
                    `/file/manifest/${deploymentObj._id}`,
                    JSON.stringify(deploymentObj)
                );

                if (res.deviceResponses?.[deviceId]?.status === 200) {
                    // Wait for animation to complete before running the function
                    await new Promise((resolve) =>
                        setTimeout(resolve, ANIMATION_MOVING_TIME)
                    );

                    // Allow to run the demo time only for device running functions for simulating the device running.
                    if (moduleName.includes("run")) {
                        setDemoRunning(true);
                    }
                    await runFunction(deploymentObj._id, 3600, Math.floor(demoTime / 1000));

                    if (moduleName.includes("energy-query")) {
                        setHourlyQueryCompleted(true);
                    }
                } else {
                    console.error("Device response status is not 200");
                }
            } catch (error) {
                console.error("Error during wasm module deployment:", error);
            }
        },
        [demoTime]
    );

    /**
     * Executes the wasm module on the device.
     *
     * @param {string} deploymentId - The unique ID of the deployment.
     * @param {number} timeDuration - The duration (in seconds) for which the wasm module will run.
     * @param {number} startTime - The start time parameter to initialize the wasm module.
     */
    const runFunction = async (deploymentId, timeDuration, startTime) => {
        try {
            const endpoint = `/execute/${deploymentId}`;
            const postData = {
                param0: startTime,
                param1: timeDuration,
            };
            const res = await fetchPostData(endpoint, postData);
            setDemoRunning(false);
            console.log(`Response from the wasm module:`, res);
        } catch (error) {
            console.error("Error deploying module:", error);
            return {};
        }
    };

    /**
     * Start of the demo.
     */
    const handleStart = useCallback(async () => {
        await wasmModuleDeployment("wm-run");
        await wasmModuleDeployment("wm-energy-query");

    }, [wasmModuleDeployment]);

    useEffect(() => {
        if (hourlyQueryCompleted) {
            setHourlyQueryCompleted(false);
            handleStart();
        }
    }, [hourlyQueryCompleted]);

    return (
        <div>
            <div>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mr: 4 }}
                    onClick={handleStart}
                >
                    Start
                </Button>
            </div>
            <div style={{ marginTop: "5%" }}>
                <RealtimeClock />
                <DemoClock
                    demoRunning={demoRunning}
                    setDemoRunning={(status) => setDemoRunning(status)}
                    onDemoTimeChange={(newTime) => setDemoTime(newTime)}
                />
            </div>
        </div>
    );
};

export default DemoControlls;
