// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useState, useEffect, useCallback } from "react";
import { Button } from "@mui/material";
import { fetchData,fetchPostData, fetchIntelligentControllerData } from "../../services/apiService";
import RealtimeClock from "../RealtimeClock";
import DemoClock from "../DemoClock";
import PropTypes from "prop-types";
import { WASHING_MACHINE, WITHOUT_LIQUID_AI, WITH_LIQUID_AI } from "../../../constants";
import DropdownMenu from "./DropdownMenu";

// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = process.env.ANIMATION_MOVING_TIME;

const DemoControlls = ({ onLogAdd, queryingAnimationRun, userRequirement, onUpdateOptimizedTimeSlots, onRunMethodSelect }) => {
    const [demoRunning, setDemoRunning] = useState(false);
    const [demoTime, setDemoTime] = useState(new Date().setMinutes(0, 0));
    const [optimezedTimeSlots, setOptimezedTimeSlots] = useState({});
    const [selectedRunMethod, setSelectedRunMethod] = useState(WITHOUT_LIQUID_AI);
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
                onLogAdd(`Deployment of ${deploymentObj.name} module`);
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
                        onLogAdd(`Running washing-machine....`);
                        setDemoRunning(true);
                    } else {
                        // await queryingAnimationRun();
                    }

                    const res = await runFunction(deploymentObj._id, 3600, Math.floor(demoTime / 1000));

                    // if (moduleName.includes("energy-query")) {
                    //     const newTime = new Date(demoTime);
                    //     newTime.setHours(newTime.getHours() + 1);
                    //     onLogAdd(`Energy usage between (${new Date(demoTime).toLocaleTimeString()} - ${newTime.toLocaleTimeString()}) : ${res[0]}`);
                    //     setHourlyQueryCompleted(true);
                    // }
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
            // setDemoRunning(false);
            console.log(`Response from the wasm module:`, res);
            return res
        } catch (error) {
            console.error("Error deploying module:", error);
            return {};
        }
    };

    /**
     * This function calculates and sets the optimized running time slots for the washing machine.
     * It makes an API request to fetch the most optimized time slots for a given time range.
     * 
     * @param {number} startDateTime - The start date and time in UNIX timestamp format for the optimized time calculation.
     * @param {number} endDateTime - The end date and time in UNIX timestamp format for the optimized time calculation.
     * 
     */
    const setWashingMachineRunningTime = async (startDateTime, endDateTime) => {
        try {
            const endpoint = `/cheapestHour`;
            const postData = {
                startDateTime: startDateTime,
                endDateTime: endDateTime,
            };  
            const res = await fetchIntelligentControllerData(endpoint, postData);
            updateEquipmentOptimizedTimeSlots(WASHING_MACHINE, res);
            return res
        } catch (error) {
            console.error("Error deploying module:", error);
            return {};
        }
    };

    /**
     * This function updates the state with the optimized time slots for a specific piece of equipment.
     * It takes the new data and updates the state corresponding to the specified equipment key.
     * 
     * @param {string} key - The key representing the equipment (e.g., `WASHING_MACHINE`).
     * @param {Object} newData - The new optimized time slots data to update the state with.
     * 
     */
    const updateEquipmentOptimizedTimeSlots = (key, newData) => {
        setOptimezedTimeSlots(prevState => ({
          ...prevState,
          [key]: [newData]
        }));
        onUpdateOptimizedTimeSlots(newData, key);
      };

    /**
     * Start of the demo.
     */
    const handleStart = useCallback(async () => {
        setDemoRunning(true);
        // await wasmModuleDeployment("wm-run");
        // await wasmModuleDeployment("wm-energy-query");

    }, [wasmModuleDeployment]);

    // useEffect(() => {
    //     if (hourlyQueryCompleted) {
    //         setHourlyQueryCompleted(false);
    //         handleStart();
    //     }
    // }, [hourlyQueryCompleted]);

    useEffect(() => {
        const keys = Object.keys(userRequirement);
        if (keys.length !== 0) {
            for (const key of keys) {
                switch (key) {
                    case WASHING_MACHINE:
                        setWashingMachineRunningTime(Math.floor(demoTime / 1000), userRequirement[key].completeBefore);
                        break;
                    default:
                        console.error("Invalid key");
                }
            }
        }
    }, [userRequirement]);

    useEffect(() => {

        const runWithLiquidAI = () => {
            Object.keys(optimezedTimeSlots).forEach((key) => {
                handleWasmDeployments(key);
            });
        };

        const handleWasmDeployments = (key) => {
            switch (key) {
                case WASHING_MACHINE:
                    optimezedTimeSlots[key].forEach((equipment) => {
                        const startDate = equipment.startDate;
                        const demoTimeInSeconds = Math.floor(demoTime / 1000);
                        if (startDate - demoTimeInSeconds === 0) {
                            setDemoRunning(false);
                            wasmModuleDeployment("wm-run");
                        }
                    });
                    break;

                default:
                    console.error("Invalid key");
            }
        };

        if (selectedRunMethod === WITHOUT_LIQUID_AI &&  new Date(demoTime).getMinutes() === 0 &&  demoRunning) {
            queryingAnimationRun();
        } 

        if (selectedRunMethod === WITH_LIQUID_AI) {
            runWithLiquidAI();
        }

      }, [demoTime, optimezedTimeSlots]);

    return (
      <div>
        <div>
          <DropdownMenu
            onRunMethodSelect={(value) => {
              onRunMethodSelect(value); 
              setSelectedRunMethod(value);
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 4, mt: 4 }}
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

DemoControlls.propTypes = {
    onLogAdd: PropTypes.func.isRequired,
    queryingAnimationRun: PropTypes.func.isRequired,
    userRequirement: PropTypes.object.isRequired,
    onUpdateOptimizedTimeSlots: PropTypes.func.isRequired,
    onRunMethodSelect: PropTypes.func.isRequired,
};

export default DemoControlls;
