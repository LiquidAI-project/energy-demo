// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>, Asma Jamil <asma.jamil@tuni.fi>.

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
import WasmWithOnnxScheduleIcon from "../../assets/wasm_with_onnx_schedule.png";
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
import { speak, deployAndExecute } from "../../utils/deviceUtils";
import { sendPostData } from "../../services/apiService";
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = import.meta.env.VITE_ANIMATION_MOVING_TIME;

const DemoControlls = ({ continousAnimationRun, runMoveCodeAnimation, setPaused, pausedRef, pauseAwareDelay, referenceLineEnabled, setReferenceLineEnabled, handlePopOverClose, setRescheduleHistory, animationSessionRef }) => {
  const {
    deviceStatus,
    blackoutActive,
    movingDeployments,
    changeHackerVisibility,
    setDayPlans,
    setHistoricalDayPlans,
    setElectricCar1,
    setElectricCar2,
    setMovingDeployments,
    setBlackoutActive,
    setDischargingSlots
  } = useDemoVisualizationContext();
  const { voiceEnabled, demoRunMethod, demoRunning, scheduleProcessing, demoTime, demoStatus, setDemoRunning, resetArchitectutreAnimations, setScheduleProcessing, setDemoTime, setVoiceEnabled, setDemoStatus } = useDemoControlContext();


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
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
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
      setElectricCar1(prev => ({ ...prev, pluggedIn: true }));
      setElectricCar2(prev => ({ ...prev, pluggedIn: true }));
      if (voiceEnabled)
        speak("Electric cars are available for charging");
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(EV_CHARGER, ORCHESTRATOR, NewDeviceDiscoveryIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, NewDeviceInfoIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(ENERGY_COMPANY, INTELLIGENT_CONTROL, SpotPriceDataIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDayPlans(predefinedDayPlan1);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxScheduleIcon, null, sessionId);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxScheduleIcon, null, sessionId);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 0 && currentMinute === 50) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      const result = await deployAndExecute("6904c92175d1501dc7b259d3", "Fibo_EV", EV_CHARGER, { "param0": 8 });
      if (result === "Success") {
        if (voiceEnabled)
          speak("Module is deployed on E V Charger");
      } else {
        if (voiceEnabled)
          speak(result);
      }
    }

    if (currentHour == 2 && currentMinute === 40) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      const result = await deployAndExecute("6904c91175d1501dc7b259a6", "Fibo_Freezer", FREEZER, { "param0": 10 });
      if (result === "Success") {
        if (voiceEnabled)
          speak("Module is deployed on Freezer");
      } else {
        if (voiceEnabled)
          speak(result);
      }
    }

    // Electric car charging simulation (hours 1-5)
    // Battery: 60 kWh total capacity
    // Starting charge: 12 kWh
    // Charging rate: 11 kWh per hour
    // After 4 hours (1-5): 12 + 44 = 56 kWh
    if (currentHour >= 1 && currentHour < 5) {
      const startHour = 1;
      const startingCharge = 10; // kWh
      const chargingRatePerHour = 11; // kWh per hour
      const hoursElapsed = (currentHour - startHour) + (currentMinute / 60);

      // Calculate current energy (starting charge + charged amount)
      const chargedAmount = hoursElapsed * chargingRatePerHour;
      const currentEnergyLevel = Math.min(startingCharge + chargedAmount, 60); // Cap at total capacity
      const currentEnergy = Math.floor(currentEnergyLevel);

      // Available energy is current - minimum required (40 kWh)
      const minRequired = 40;
      const currentAvailableEnergy = Math.max(0, currentEnergy - minRequired);

      // Update both cars
      setElectricCar1(prev => ({
        ...prev,
        currentEnergy: currentEnergy,
        dischargeableEnergy: currentAvailableEnergy
      }));

      setElectricCar2(prev => ({
        ...prev,
        currentEnergy: currentEnergy,
        dischargeableEnergy: currentAvailableEnergy
      }));
    }

    // Set to final charge at hour 5 (12 + 44 = 56 kWh after 4 hours of charging)
    if (currentHour === 5 && currentMinute === 0) {
      setElectricCar1(prev => ({
        ...prev,
        currentEnergy: 56,
        dischargeableEnergy: 16  // 56 - 40 (min required) = 16
      }));

      setElectricCar2(prev => ({
        ...prev,
        currentEnergy: 56,
        dischargeableEnergy: 16
      }));
    }

    // Demand spike simulation
    if (currentHour == 4 && currentMinute === 30) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
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
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      if (voiceEnabled)
        speak("Sudden spike in electricity prices noticed, rescheduling device operating times");
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDayPlans(predefinedDayPlan2);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan1]);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxScheduleIcon, null, sessionId);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxScheduleIcon, null, sessionId);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    // Blackout simulation at 6:50
    if (currentHour == 6 && currentMinute === 20) {
      setBlackoutActive(true);
      if (voiceEnabled)
        speak("Power outage detected");
    }

    if (currentHour == 6 && currentMinute === 50) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      const result = await deployAndExecute("6904c91175d1501dc7b259a6", "Fibo_Freezer", FREEZER, { "param0": 10 });
      if (result === "Success") {
        if (blackoutActive) {
          setElectricCar2(prev => ({
            ...prev,
            provideEnergy: true,
            lineToFreezer: true,
            // Initial drop or setup for discharge
          }));

          // Add discharging slot (6:50 to 9:00)
          setDischargingSlots(prev => [...prev, { start: 7, end: 9, isDischarging: true }]);
        }
        if (voiceEnabled)
          speak("Module is deployed on Freezer");
      } else {
        if (voiceEnabled)
          speak(result);
      }
    }

    // Discharge simulation for ElectricCar2 (6:50 - 9:00)
    // Total discharge needed: 2.50 kWh
    // Duration: 2 hours
    // Discharge rate: 2.50 kWh/hour
    if (currentHour >= 7 && currentHour < 9) {
      const startHour = 7;
      const currentTime = currentHour + (currentMinute / 60);
      const hoursElapsed = currentTime - startHour;

      const dischargeRate = 2.5; // kWh per hour
      const dischargedAmount = hoursElapsed * dischargeRate;

      // Starting energy at 6:50 is 56 kWh (from previous logic)
      const startingEnergy = 56;
      const currentEnergyLevel = Math.max(startingEnergy - dischargedAmount, 0);
      const currentEnergy = Math.floor(currentEnergyLevel * 10) / 10; // Keep 1 decimal for smoother look

      // Available energy is current - minimum required (40 kWh)
      const minRequired = 40;
      const currentAvailableEnergy = Math.max(0, currentEnergy - minRequired);

      setElectricCar2(prev => ({
        ...prev,
        currentEnergy: currentEnergy,
        dischargeableEnergy: currentAvailableEnergy
      }));
    }

    if (currentHour == 7 && currentMinute === 40) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      const result = await deployAndExecute("6904c93375d1501dc7b25a00", "Fibo_WM", WASHING_MACHINE, { "param0": 6 });
      if (result === "Success") {
        if (blackoutActive) {
          setElectricCar1(prev => ({
            ...prev,
            provideEnergy: true,
            lineToWashingMachine: true,
            // Initial drop or setup for discharge
          }));
        }
        if (voiceEnabled)
          speak("Module is deployed on washing machine");
      } else {
        if (voiceEnabled)
          speak(result);
      }
    }

    if (currentHour >= 8 && currentHour < 9) {
      const startHour = 8;
      const currentTime = currentHour + (currentMinute / 60);
      const hoursElapsed = currentTime - startHour;

      const dischargeRate = 2.5; // kWh per hour
      const dischargedAmount = hoursElapsed * dischargeRate;

      // Starting energy at 7:40 is 56 kWh (assuming it was full/same as start)
      const startingEnergy = 56;
      const currentEnergyLevel = Math.max(startingEnergy - dischargedAmount, 0);
      const currentEnergy = Math.floor(currentEnergyLevel * 10) / 10; // Keep 1 decimal for smoother look

      // Available energy is current - minimum required (40 kWh)
      const minRequired = 40;
      const currentAvailableEnergy = Math.max(0, currentEnergy - minRequired);

      setElectricCar1(prev => ({
        ...prev,
        currentEnergy: currentEnergy,
        dischargeableEnergy: currentAvailableEnergy
      }));
    }

    // End blackout at 9:00
    if (currentHour == 9 && currentMinute === 0) {
      setBlackoutActive(false);
      setElectricCar2(prev => ({ ...prev, provideEnergy: false, lineToFreezer: false }));
      setElectricCar1(prev => ({ ...prev, provideEnergy: false, lineToWashingMachine: false }));
      if (voiceEnabled)
        speak("Power restored");
    }

    // EV unplug simulation
    if (currentHour == 10 && currentMinute === 0) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      setElectricCar1(prev => ({ ...prev, pluggedIn: false }));
      setElectricCar2(prev => ({ ...prev, pluggedIn: false }));
      if (voiceEnabled)
        speak("Electric cars are not available");
    }

    // Car usage simulation (10:00 - 18:00)
    // Car 1: 50.7 -> 25 (Diff 25.7 over 8h) => 3.2125 kWh/h
    // Car 2: 51.0 -> 34 (Diff 17.0 over 8h) => 2.125 kWh/h
    if (currentHour >= 10 && currentHour < 18) {
      const startHour = 10;
      const currentTime = currentHour + (currentMinute / 60);
      const hoursElapsed = currentTime - startHour;

      // Car 1
      const startEnergy1 = 53.9;
      const rate = 5;
      const currentEnergy1 = Math.max(0, startEnergy1 - (hoursElapsed * rate));

      setElectricCar1(prev => ({
        ...prev,
        currentEnergy: Math.floor(currentEnergy1 * 10) / 10,
        dischargeableEnergy: Math.max(0, currentEnergy1 - 40) // Not plugged in
      }));

      // Car 2
      const startEnergy2 = 51.4;
      const currentEnergy2 = Math.max(0, startEnergy2 - (hoursElapsed * rate));

      setElectricCar2(prev => ({
        ...prev,
        currentEnergy: Math.floor(currentEnergy2 * 10) / 10,
        dischargeableEnergy: Math.max(0, currentEnergy2 - 40) // Not plugged in
      }));
    }

    // Washing machine set to simulation and EV unplug simulation
    if (currentHour == 9 && currentMinute === 40) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
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
      runMoveCodeAnimation(USER_CONTROL, INTELLIGENT_CONTROL, UserInputIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      if (voiceEnabled)
        speak("User wants to turn on washing machine, rescheduling time");
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDayPlans(predefinedDayPlan3);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      const result = await deployAndExecute("6904c93375d1501dc7b25a00", "Fibo_WM", WASHING_MACHINE, { "param0": 6 });
      if (result === "Success") {
        if (voiceEnabled)
          speak("Module is deployed on washing machine");
      } else {
        if (voiceEnabled)
          speak(result);
      }
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan2]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    // Demand spike simulation
    if (currentHour == 13 && currentMinute === 0) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
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
      if (voiceEnabled)
        speak("Sudden spike in electricity prices noticed, rescheduling device operating times");
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDayPlans(predefinedDayPlan4);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxScheduleIcon, null, sessionId);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan3]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 14 && currentMinute === 40) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      const result = await deployAndExecute("6904c93375d1501dc7b25a00", "Fibo_WM", WASHING_MACHINE, { "param0": 6 });
      if (result === "Success") {
        if (voiceEnabled)
          speak("Module is deployed on washing machine");
      } else {
        if (voiceEnabled)
          speak(result);
      }
    }

    // EV plug back in simulation
    if (currentHour == 18 && currentMinute === 0) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      setDemoRunning(false);
      setScheduleProcessing(true);
      setElectricCar1(prev => ({ ...prev, pluggedIn: true }));
      setElectricCar2(prev => ({ ...prev, pluggedIn: true }));
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
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
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(EV_CHARGER, ORCHESTRATOR, NewDeviceDiscoveryIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(ORCHESTRATOR, INTELLIGENT_CONTROL, NewDeviceInfoIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDayPlans(predefinedDayPlan5);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan4]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 19 && currentMinute === 40) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      const result = await deployAndExecute("6904c91175d1501dc7b259a6", "Fibo_Freezer", FREEZER, { "param0": 10 });
      if (result === "Success") {
        if (voiceEnabled)
          speak("Module is deployed on Freezer");
      } else {
        if (voiceEnabled)
          speak(result);
      }
    }

    // Demand spike simulation
    if (currentHour == 21 && currentMinute === 0) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
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
      if (voiceEnabled)
        speak("Sudden spike in electricity prices noticed, rescheduling device operating times");
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDayPlans(predefinedDayPlan6);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan5]);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if (currentHour == 21 && currentMinute === 40) {
      const sessionId = uuidv4();
      animationSessionRef.current = sessionId;
      let result = await deployAndExecute("6904c91175d1501dc7b259a6", "Fibo_Freezer", FREEZER, { "param0": 8 });
      if (result === "Success") {
        if (voiceEnabled)
          speak("Module is deployed on freezer");
        await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      } else {
        if (voiceEnabled)
          speak(result);
      }

      result = await deployAndExecute("6904c92175d1501dc7b259d3", "Fibo_EV", EV_CHARGER, { "param0": 6 });
      if (result === "Success") {
        if (voiceEnabled)
          speak("Module is deployed on E V Charger");
      } else {
        if (voiceEnabled)
          speak(result);
      }
    }

    if (currentHour >= 22 && currentHour < 23) {
      const startHour = 22;
      const startingCharge1 = 14.7; // kWh
      const startingCharge2 = 12.2; // kWh
      const chargingRatePerHour = 11; // kWh per hour
      const hoursElapsed = (currentHour - startHour) + (currentMinute / 60);

      // Calculate current energy (starting charge + charged amount)
      const chargedAmount = hoursElapsed * chargingRatePerHour;
      const currentEnergyLevel1 = Math.min(startingCharge1 + chargedAmount, 60); // Cap at total capacity
      const currentEnergyLevel2 = Math.min(startingCharge2 + chargedAmount, 60); // Cap at total capacity
      const currentEnergy1 = Math.floor(currentEnergyLevel1);
      const currentEnergy2 = Math.floor(currentEnergyLevel2);

      // Available energy is current - minimum required (40 kWh)
      const minRequired = 40;
      const currentAvailableEnergy1 = Math.max(0, currentEnergy1 - minRequired);
      const currentAvailableEnergy2 = Math.max(0, currentEnergy2 - minRequired);

      // Update both cars
      setElectricCar1(prev => ({
        ...prev,
        currentEnergy: currentEnergy1,
        dischargeableEnergy: currentAvailableEnergy1
      }));

      setElectricCar2(prev => ({
        ...prev,
        currentEnergy: currentEnergy2,
        dischargeableEnergy: currentAvailableEnergy2
      }));
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

  useEffect(() => {
    if (demoRunMethod == WITH_LIQUID_AI && scheduleProcessing) {
      setPaused(false);
      setDemoStatus("running");
      dayPlanExecution();
    }
  }, []);

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
    setScheduleProcessing(false);
    resetArchitectutreAnimations();
    animationSessionRef.current = null;
    setMovingDeployments([]);
    setDayPlans(initialDayPlan);
    setElectricCar1(prev => ({ ...prev, pluggedIn: false, provideEnergy: false, currentEnergy: 10, dischargeableEnergy: 0 }));
    setElectricCar2(prev => ({ ...prev, pluggedIn: false, provideEnergy: false, currentEnergy: 10, dischargeableEnergy: 0 }));
    setPaused(false);
    setHistoricalDayPlans([initialDayPlan]);
    setRescheduleHistory([]);
    setDischargingSlots([]);
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
        <DropdownMenu resetDemoTimer={resetDemoTimer} />
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