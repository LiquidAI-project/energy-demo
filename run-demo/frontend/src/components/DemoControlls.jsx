// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { Button } from "@mui/material";
import { fetchData,fetchPostData } from "../services/apiService";

// eslint-disable-next-line no-undef
const ANUMATION_MOVING_TIME = process.env.ANUMATION_MOVING_TIME;

const DemoControlls = () => {
    /**
     * Fetches the manifest data and finds the deployment object with given name.
     * If found, it proceeds to deploy the wasm module for that object.
     */
    const handleStart = async () => {
        try {
            const response = await fetchData("/file/manifest");

            // Find the deployment object where name is "wm-run"
            const deploymentObj = response.find((obj) => obj.name === "wm-run");

            if (deploymentObj) {
                console.log(`Processing deployment : ${deploymentObj.name}`);
                wasmModuleDeployment(deploymentObj);
            } else {
                console.warn("No deployment found");
            }
        } catch (error) {
            console.error(
                "Error fetching manifests when starting the demo:",
                error
            );
        }
    };

    /**
     * Deploys the wasm module to the specified device.
     * After confirming the deployment status, it pauses for the animation duration
     * and then triggers the run function to start the wasm module on the device.
     *
     * @param {Object} deploymentObj - The deployment object containing device information.
     */
    const wasmModuleDeployment = async (deploymentObj) => {
        try {
            const deviceId = deploymentObj.sequence[0].device;
            const res = await fetchPostData(`/file/manifest/${deploymentObj._id}`,JSON.stringify(deploymentObj));

            if (res.deviceResponses[deviceId].status === 200) {
                // Wait for 5 seconds until the animation of moving wasm module to the device is finished
                await new Promise((resolve) =>
                    setTimeout(resolve, ANUMATION_MOVING_TIME)
                );
                runFunction(deploymentObj._id, 3600, 1731304800);
                console.log("Running washing machine");
            }
        } catch (error) {
            console.error("Error when deploying wasm modules:", error);
        }
    };

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
            console.log("Response from running wasm module:", res);
        } catch (error) {
            console.error("Error deploying module:", error);
            return {};
        }
    };

    return (
        <div>
            <Button
                variant="contained"
                color="primary"
                sx={{ mr: 4 }}
                onClick={handleStart}
            >
                Start
            </Button>
            <Button variant="contained" color="primary">
                Next
            </Button>
        </div>
    );
};

export default DemoControlls;
