// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useEffect, useState } from "react";
import { Button, Box } from "@mui/material";
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";
import DemoClock from "../DemoClock";
import PropTypes from "prop-types";
import {
  EV_CHARGER,
  HACKER,
  INTELLIGENT_CONTROL,
  ORCHESTRATOR,
  SERVICE_PROVIDER1,
  SERVICE_PROVIDER2,
  USER_CONTROL,
  WASHING_MACHINE,
  WITHOUT_LIQUID_AI,
  WITH_LIQUID_AI,
  ENERGY_COMPANY,
  FREEZER,
  FLEXIBILITY_SERVICE,
} from "../../../constants";
import UnsafeDataIcon from "../../assets/unsafe_data_icon.png";
import SpotPriceDataIcon from "../../assets/spotPriceDataIcon.png";
import DemandSpikeIcon from "../../assets/demand_spike.png";
import UserInputIcon from "../../assets/user_input.png";
import WasmWithOnnxIcon from "../../assets/wasm_with_onnx.png";
import ScheduleIcon from "../../assets/schedule.png";
import OnnxFileIcon from "../../assets/onnx_file.png";
import DropdownMenu from "./DropdownMenu";
import { useDemoControlContext } from "../../context/demoControlContext/useDemoControlContext";
import {
  initialDayPlan,
  predefinedDayPlan1,
  predefinedDayPlan2,
  predefinedDayPlan3,
  predefinedDayPlan4,
  predefinedDayPlan5,
  predefinedDayPlan6,
} from "../../assets/mockData/dailyPlan";

// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = process.env.ANIMATION_MOVING_TIME;

const DemoControlls = ({ continousAnimationRun, runMoveCodeAnimation, setPaused, pausedRef, pauseAwareDelay }) => {
  const {
    deviceStatus,
    movingDeployments,
    changeHackerVisibility,
    setDayPlans,
    setHistoricalDayPlans,
    setEv1PluggedIn,
    setEv2PluggedIn,
  } = useDemoVisualizationContext();
  const { demoRunMethod, demoRunning, demoTime, setDemoRunning, setDemoTime } = useDemoControlContext();
  const { setMovingDeployments } = useDemoVisualizationContext();
  const [demoStatus, setDemoStatus] = useState("idle"); // idle | running | stopped

  /**
   * ML model retraining simulation.
   */
  const mlModelRetrainSimulation = 
    async (currentMinute) => {
      // Simulation of sending ML model to retrain near to data source
      if (currentMinute === 10) {
        deviceStatus.forEach((device) => {
          if (device.isEnergyIntensive) {
            runMoveCodeAnimation(
              ORCHESTRATOR,
              device.deviceName,
              WasmWithOnnxIcon
            );
          }
        });
      }

      // Simulation of sending back the trained ML model to orchestrator
      if (currentMinute === 50) {
        deviceStatus.forEach((device) => {
          if (device.isEnergyIntensive) {
            runMoveCodeAnimation(device.deviceName, ORCHESTRATOR, OnnxFileIcon);
          }
        });
      }
    };

  /**
   * Plan of application and date movement simulation.
   */
  const dayPlanExecution = async () => {
    const currentDate = new Date(demoTime);
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    mlModelRetrainSimulation(currentMinute);

    // Spot price fetch simulation
    if (currentHour == 0 && currentMinute === 30) {
      //setDemoRunning(false);
      runMoveCodeAnimation(ENERGY_COMPANY, INTELLIGENT_CONTROL, SpotPriceDataIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, WasmWithOnnxIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setDayPlans(predefinedDayPlan1);
    }

    // Demand spike simulation
    if (currentHour == 4 && currentMinute === 0) {
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, WasmWithOnnxIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setDayPlans(predefinedDayPlan2);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan1]);
    }

    // EV unplug simulation
    if (currentHour == 7 && currentMinute === 0) {
      setEv1PluggedIn(false);
      setEv2PluggedIn(false);
    }

    // Washing machine set to simulation
    if (currentHour == 10 && currentMinute === 0) {
      runMoveCodeAnimation(USER_CONTROL, INTELLIGENT_CONTROL, UserInputIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, WasmWithOnnxIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setDayPlans(predefinedDayPlan3);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan2]);
    }

    // Demand spike simulation
    if (currentHour == 13 && currentMinute === 0) {
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, WasmWithOnnxIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setDayPlans(predefinedDayPlan4);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan3]);
    }

    // EV plug back in simulation
    if (currentHour == 18 && currentMinute === 0) {
      setEv1PluggedIn(true);
      setEv2PluggedIn(true);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, WasmWithOnnxIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setDayPlans(predefinedDayPlan5);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan4]);
    }

    // Demand spike simulation
    if (currentHour == 21 && currentMinute === 0) {
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, WasmWithOnnxIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setDayPlans(predefinedDayPlan6);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan5]);
    }

    if (currentHour == 23 && currentMinute == 50)
      handleRestart();
  };

  useEffect(() => {
    const currentDate = new Date(demoTime);
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    if (demoRunMethod === WITHOUT_LIQUID_AI && demoRunning) {

      if (currentMinute % 20 === 0) {
        continousAnimationRun();
      }

      if (currentHour == 0 && currentMinute === 30) {
        setDayPlans(predefinedDayPlan1);
      }

      if (currentMinute === 40) {
        changeHackerVisibility(true);
      }

      if (currentMinute === 50) {
        runMoveCodeAnimation(SERVICE_PROVIDER1, HACKER, UnsafeDataIcon);
        runMoveCodeAnimation(SERVICE_PROVIDER2, HACKER, UnsafeDataIcon);
      }

      if (currentMinute === 20) {
        changeHackerVisibility(false);
      }

      if (currentHour == 4 && currentMinute === 0) {
        setDayPlans(predefinedDayPlan2);
        setHistoricalDayPlans(prev => [...prev, predefinedDayPlan1]);
      }

      if (currentHour == 10 && currentMinute === 0) {
        setDayPlans(predefinedDayPlan3);
        setHistoricalDayPlans(prev => [...prev, predefinedDayPlan2]);
      }

      if (currentHour == 13 && currentMinute === 0) {
        setDayPlans(predefinedDayPlan4);
        setHistoricalDayPlans(prev => [...prev, predefinedDayPlan3]);
      }

      if (currentHour == 18 && currentMinute === 0) {
        setDayPlans(predefinedDayPlan5);
        setHistoricalDayPlans(prev => [...prev, predefinedDayPlan4]);
      }

      if (currentHour == 21 && currentMinute === 0) {
        setDayPlans(predefinedDayPlan6);
        setHistoricalDayPlans(prev => [...prev, predefinedDayPlan5]);
      }

      if (currentHour == 23 && currentMinute == 50)
        handleRestart();
    }

    if (demoRunMethod === WITH_LIQUID_AI && demoRunning) {
      dayPlanExecution();
    }
  }, [demoTime]);

  const handleStart = () => {
    setDemoStatus("running");
    setDemoRunning(true);
    setPaused(false);
  };

  const handleStop = () => {
    setDemoStatus("stopped");
    setDemoRunning(false);
    setPaused(true);
  };

  const handleResume = () => {
    setDemoStatus("running");
    setDemoRunning(true);
    setPaused(false);
  };

  const handleRestart = () => {
    resetDemoTimer();
    setDemoStatus("running");
    setDemoRunning(true);
  };

  const resetDemoTimer = () => {
    const resetDemoTime = new Date();
    resetDemoTime.setHours(0, 0, 0, 0);
    setDemoTime(resetDemoTime);
    setDemoRunning(false);
    setMovingDeployments([]);
    setDayPlans(initialDayPlan);
    setEv1PluggedIn(true);
    setEv2PluggedIn(true);
    setPaused(false);
    setHistoricalDayPlans([initialDayPlan]);
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} marginBottom={2}>
        <DropdownMenu resetDemoTimer={resetDemoTimer} setDemoStatus={setDemoStatus} />
        {demoStatus === "idle" && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            sx={{
              backgroundColor: "green",
              color: "white",
              height: "50px",
              fontSize: "1rem",
              "&:hover": { backgroundColor: "darkgreen" },
            }}
          >
            Start
          </Button>
        )}

        {demoStatus === "running" && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStop}
            sx={{
              backgroundColor: "red",
              color: "white",
              height: "50px",
              fontSize: "1rem",
              "&:hover": { backgroundColor: "darkred" },
            }}
          >
            Stop
          </Button>
        )}

        {demoStatus === "stopped" && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleResume}
              sx={{
                backgroundColor: "orange",
                color: "white",
                height: "50px",
                fontSize: "1rem",
                "&:hover": { backgroundColor: "darkorange" },
              }}
            >
              Resume
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={handleRestart}
              sx={{
                backgroundColor: "lightblue",
                color: "white",
                height: "50px",
                fontSize: "1rem",
                "&:hover": { backgroundColor: "skyblue" },
              }}
            >
              Restart
            </Button>
          </>
        )}
      </Box>
      <DemoClock />
    </Box>
  );
};

DemoControlls.propTypes = {
  continousAnimationRun: PropTypes.func.isRequired,
  runMoveCodeAnimation: PropTypes.func.isRequired,
};

export default DemoControlls;