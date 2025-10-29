// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useEffect, useState } from "react";
import { Button, Box, FormControlLabel, Switch } from "@mui/material";
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
import NewDeviceDiscoveryIcon from "../../assets/new-device.png";
import NewDeviceInfoIcon from "../../assets/new-device-info.png";
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
import { speak } from "../../utils/deviceUtils";
import { sendPostData } from "../../services/apiService";

// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = import.meta.env.VITE_ANIMATION_MOVING_TIME;

const DemoControlls = ({ continousAnimationRun, runMoveCodeAnimation, setPaused, pausedRef, pauseAwareDelay, referenceLineEnabled, setReferenceLineEnabled, handlePopOverClose, setRescheduleHistory }) => {
  const {
    deviceStatus,
    movingDeployments,
    changeHackerVisibility,
    setDayPlans,
    setHistoricalDayPlans,
    setEv1PluggedIn,
    setEv2PluggedIn,
    setMovingDeployments
  } = useDemoVisualizationContext();
  const { voiceEnabled, demoRunMethod, demoRunning, scheduleProcessing, demoTime, setDemoRunning, setScheduleProcessing, setDemoTime, setVoiceEnabled } = useDemoControlContext();
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

    //mlModelRetrainSimulation(currentMinute);

    // Spot price fetch simulation
    if (currentHour == 0 && currentMinute === 30) {
      setRescheduleHistory((prev) => [
        ...prev, 
        {
          title: "00:30",
          content:
            "The energy provider transmits electricity price information for the current hour to the Intelligence Control. The Intelligence Control then sends the optimal schedules to the Orchestrator, which forwards them to target devices for efficient energy use."
        }
      ]);
      setDemoRunning(false);
      setScheduleProcessing(true);
      setEv1PluggedIn(true);
      setEv2PluggedIn(true);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      if (voiceEnabled) {
        speak("Electric cars are available for charging");
      }
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(EV_CHARGER, ORCHESTRATOR, NewDeviceDiscoveryIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, NewDeviceInfoIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ENERGY_COMPANY, INTELLIGENT_CONTROL, SpotPriceDataIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      setDayPlans(predefinedDayPlan1);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      //console.log("Sending Fibo module deploy request"); 
      //await sendPostData("/file/manifest/68ef769e1c910eb512fef63b"); // Deploy FiboDep1 deployment
      //await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      //console.log("Deploy request complete");
      /*setTimeout(() => {
        console.log("Waiting for some time before the next animation happens");
        runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      }, 5000);*/
      //console.log("Sending module execution request -- Param0"); 
      //await sendPostData("/execute/68ef769e1c910eb512fef63b", {"param0": 8}); // Execute FiboDep1 deployment
      //await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      //console.log("Execution request complete");
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 1 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on E V Charger");
    }

    if (currentHour == 2 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on Freezer");
    }

    // Demand spike simulation
    if (currentHour == 4 && currentMinute === 30) {
      setDemoRunning(false);
      setScheduleProcessing(true);
      setRescheduleHistory((prev) => [
        ...prev, 
        {
          title: "04:00",
          content:
            "The Flexibility Service analyzes new price data for significant changes, such as spikes, and informs the Intelligence Control, which recalculates optimal schedules and forwards them to the Orchestrator. The Orchestrator then distributes the updated schedules to target devices for efficient energy use."
        }
      ]);
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon);
      if(voiceEnabled)
        speak("Sudden spike in electricity prices noticed, rescheduling device operating times");
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      setDayPlans(predefinedDayPlan2);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan1]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 6 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on Freezer");
    }

    if (currentHour == 7 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on washing machine");
    }

    // EV unplug simulation
    if (currentHour == 8 && currentMinute === 0) {
      setEv1PluggedIn(false);
      setEv2PluggedIn(false);
      if(voiceEnabled)
        speak("Electric cars are not available");
    }

    if (currentHour == 9 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on washing machine");
    }

    // Washing machine set to simulation and EV unplug simulation
    if (currentHour == 10 && currentMinute === 0) {
      setDemoRunning(false);
      setScheduleProcessing(true);
      setRescheduleHistory((prev) => [
        ...prev, 
        {
          title: "10:00",
          content:
            "The user requests optimal schedules from the Intelligence Control, which recalculates them and forwards them to the Orchestrator. The Orchestrator then distributes the updated schedules to target devices for efficient energy use."
        }
      ]);
      runMoveCodeAnimation(USER_CONTROL, INTELLIGENT_CONTROL, UserInputIcon);
      if(voiceEnabled)
        speak("User wants to turn on washing machine, rescheduling time");
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      setDayPlans(predefinedDayPlan3);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan2]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 11 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on freezer");
    }

    // Demand spike simulation
    if (currentHour == 13 && currentMinute === 0) {
      setDemoRunning(false);
      setScheduleProcessing(true);
      setRescheduleHistory((prev) => [
        ...prev, 
        {
          title: "13:00",
          content:
            "The Flexibility Service analyzes new price data for significant changes, such as spikes, and informs the Intelligence Control, which recalculates optimal schedules and forwards them to the Orchestrator. The Orchestrator then distributes the updated schedules to target devices for efficient energy use."
        }
      ]);
      if(voiceEnabled)
        speak("Sudden spike in electricity prices noticed, rescheduling device operating times");
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      setDayPlans(predefinedDayPlan4);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan3]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 14 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on washing machine");
    }

    // EV plug back in simulation
    if (currentHour == 18 && currentMinute === 0) {
      setDemoRunning(false);
      setScheduleProcessing(true);
      setEv1PluggedIn(true);
      setEv2PluggedIn(true);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      if (voiceEnabled) {
        speak("Electric cars are available for charging again");
      }
      setRescheduleHistory((prev) => [
        ...prev, 
        {
          title: "18:00",
          content:
            "The Intelligence control receives the updated electricity price information for the current hour from the enerygy company. It then recalculates and sends the optimal schedules to the Orchestrator, which forwards them to target devices for efficient energy use."
        }
      ]);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(EV_CHARGER, ORCHESTRATOR, NewDeviceDiscoveryIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, NewDeviceInfoIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      setDayPlans(predefinedDayPlan5);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan4]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 18 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on freezer");
    }

    // Demand spike simulation
    if (currentHour == 21 && currentMinute === 0) {
      setDemoRunning(false);
      setScheduleProcessing(true);
      setRescheduleHistory((prev) => [
        ...prev, 
        {
          title: "21:00",
          content:
            "The Flexibility Service analyzes new price data for significant changes, such as spikes, and informs the Intelligence Control, which recalculates optimal schedules and forwards them to the Orchestrator. The Orchestrator then distributes the updated schedules to target devices for efficient energy use."
        }
      ]);
      if(voiceEnabled)
        speak("Sudden spike in electricity prices noticed, rescheduling device operating times");
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon);
      setDayPlans(predefinedDayPlan6);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, ScheduleIcon);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, ScheduleIcon);
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan5]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 21 && currentMinute === 40) {
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on freezer");
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, WasmWithOnnxIcon);
      if(voiceEnabled)
        speak("Module is deployed on E V Charger");
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
    if (!scheduleProcessing) 
      setDemoRunning(true);
    setDemoStatus("running");
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
    setEv1PluggedIn(false);
    setEv2PluggedIn(false);
    setPaused(false);
    setHistoricalDayPlans([initialDayPlan]);
    setRescheduleHistory([]);
  }

  const handleVoiceFeedback = () => {
    setVoiceEnabled((prev) => {
      const newState = !prev;
      if (newState) {
        speak("Voice feedback enabled");
      } else {
        speak("Voice feedback disabled");
      }
      return newState;
    });
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
      <FormControlLabel
        control={
          <Switch
            checked={referenceLineEnabled}
            onChange={(e) => setReferenceLineEnabled(e.target.checked)}
            color="primary"
          />
        }
        label="Toggle Reference Line"
      />
      <FormControlLabel
        control={
          <Switch
            checked={voiceEnabled}
            onChange={handleVoiceFeedback}
            color="primary"
          />
        }
        label="Toggle Voice Feedback"
      />
    </Box>
  );
};

DemoControlls.propTypes = {
  continousAnimationRun: PropTypes.func.isRequired,
  runMoveCodeAnimation: PropTypes.func.isRequired,
  referenceLineEnabled: PropTypes.bool.isRequired,
  setReferenceLineEnabled: PropTypes.func.isRequired
};

export default DemoControlls;