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
    setDeviceWorkInfo,
    changeHackerVisibility,
    setDayPlans,
    setHistoricalDayPlans,
    setElectricCar1,
    setElectricCar2,
    setMovingDeployments,
    setBlackoutActive,
    setDischargingSlots,
    updateDeviceModuleStatus,
    updateDeviceWorkInfo
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
      await deployAndExecute("6930224675d1501dc7da3403", "StartCharging", "ev-charger", {});
      updateDeviceModuleStatus("ev-charger", "ev_control:StartCharging()");
      updateDeviceWorkInfo("ev-charger", "StartCharging()", "01:00");
    }

    if (currentHour >= 1 && currentHour < 5) {
      const startHour = 1;
      const startingCharge = 10; // kWh
      const chargingRatePerHour = 7; // kWh per hour
      const hoursElapsed = (currentHour - startHour) + (currentMinute / 60);

      // Calculate current energy (starting charge + charged amount)
      const chargedAmount = hoursElapsed * chargingRatePerHour;
      const currentEnergyLevel = Math.min(startingCharge + chargedAmount, 60); // Cap at total capacity
      const currentEnergy = Math.floor(currentEnergyLevel);

      // Available energy is current - minimum required (40 kWh)
      const minRequired = 20;
      const currentAvailableEnergy = Math.max(0, currentEnergy - minRequired);

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

    if (currentHour == 2 && currentMinute === 50) {
      await deployAndExecute("693021d475d1501dc7da3346", "TurnOnFreezer", FREEZER, {});
      updateDeviceModuleStatus(FREEZER, "freezer:TurnOnFreezer()");
      updateDeviceWorkInfo("freezer", "TurnOnFreezer()", "03:00");
    }

    // Demand spike simulation
    if (currentHour == 5 && currentMinute === 0) {
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
      /* setElectricCar1(prev => ({
        ...prev,
        currentEnergy: 56,
        dischargeableEnergy: 16
      }));

      setElectricCar2(prev => ({
        ...prev,
        currentEnergy: 56,
        dischargeableEnergy: 16
      })); */
      await deployAndExecute("693021e575d1501dc7da3369", "TurnOffFreezer", FREEZER, {});
      updateDeviceModuleStatus(FREEZER, "freezer:TurnOffFreezer()");
      await deployAndExecute("6930224675d1501dc7da3403", "StopCharging", "ev-charger", {});
      updateDeviceModuleStatus("ev-charger", "ev_control:StopCharging()");
      updateDeviceWorkInfo("freezer", "TurnOffFreezer()", "05:00");
      updateDeviceWorkInfo("ev-charger", "StopCharging()", "05:00");
      runMoveCodeAnimation(FLEXIBILITY_SERVICE, INTELLIGENT_CONTROL, DemandSpikeIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      if (voiceEnabled)
        speak("Sudden spike in electricity prices noticed, rescheduling device operating times");
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      runMoveCodeAnimation(INTELLIGENT_CONTROL, ORCHESTRATOR, ScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDayPlans(predefinedDayPlan2);
      const coloredPlan1 = predefinedDayPlan1.map(device =>
        device.id === WASHING_MACHINE
          ? { ...device, slots: device.slots.map(slot => ({ ...slot, color: "#f08989da" })) }
          : device
      );
      setHistoricalDayPlans(prev => [...prev, coloredPlan1]);
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
      if (voiceEnabled)
        speak("Electric car 2 is used to provide energy to the Freezer");
      await deployAndExecute("6930227575d1501dc7da345a", "ProvideEnergyToDevices", "ev-charger", {});
      updateDeviceModuleStatus("ev-charger", "ev_control:enable_cars_to_devices()");
      await deployAndExecute("693021d475d1501dc7da3346", "TurnOnFreezer", FREEZER, {});
      updateDeviceModuleStatus(FREEZER, "freezer:TurnOnFreezer()");
      updateDeviceWorkInfo("ev-charger", "enable_cars_to_devices()", "07:00");
      updateDeviceWorkInfo("freezer", "TurnOnFreezer()", "07:00");
      if (blackoutActive) {
        setElectricCar2(prev => ({
          ...prev,
          provideEnergy: true,
          lineToFreezer: true
        }));
        setDischargingSlots(prev => [...prev, { start: 7, end: 9, isDischarging: true }]);
      }

    }

    // Reduce ElectricCar2 energy
    if (currentHour >= 7 && currentHour < 9) {
      const startHour = 7;
      const currentTime = currentHour + (currentMinute / 60);
      const hoursElapsed = currentTime - startHour;

      const dischargeRate = 1.5; // kWh per hour
      const dischargedAmount = hoursElapsed * dischargeRate;

      // Starting energy at 6:50 is 56 kWh (from previous logic)
      const startingEnergy = 36;
      const currentEnergyLevel = Math.max(startingEnergy - dischargedAmount, 0);
      const currentEnergy = Math.floor(currentEnergyLevel * 10) / 10; // Keep 1 decimal for smoother look

      // Available energy is current - minimum required (40 kWh)
      const minRequired = 20;
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
      if (voiceEnabled)
        speak("Electric car 1 is used to provide energy to the Washing machine");
      await deployAndExecute("6930227575d1501dc7da345a", "ProvideEnergyToDevices", "ev-charger", {});
      updateDeviceModuleStatus("ev-charger", "ev_control:enable_cars_to_devices()");
      await deployAndExecute("693021fc75d1501dc7da339b", "StartWashing", "washing-machine", {});
      updateDeviceModuleStatus("washing-machine", "wm_module:StartWashing()");
      updateDeviceWorkInfo("ev-charger", "enable_cars_to_devices()", "08:00");
      updateDeviceWorkInfo("washing-machine", "StartWashing()", "08:00");
      if (blackoutActive) {
        setElectricCar1(prev => ({
          ...prev,
          provideEnergy: true,
          lineToWashingMachine: true
        }));
      }
    }

    // Reduce ElectricCar1 energy
    if (currentHour >= 8 && currentHour < 9) {
      const startHour = 8;
      const currentTime = currentHour + (currentMinute / 60);
      const hoursElapsed = currentTime - startHour;

      const dischargeRate = 1.5; // kWh per hour
      const dischargedAmount = hoursElapsed * dischargeRate;

      // Starting energy at 7:40 is 56 kWh (assuming it was full/same as start)
      const startingEnergy = 36;
      const currentEnergyLevel = Math.max(startingEnergy - dischargedAmount, 0);
      const currentEnergy = Math.floor(currentEnergyLevel * 10) / 10; // Keep 1 decimal for smoother look

      // Available energy is current - minimum required (40 kWh)
      const minRequired = 20;
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
      updateDeviceWorkInfo("freezer", "TurnOffFreezer()", "09:00");
      updateDeviceWorkInfo("washing-machine", "StopWashing()", "09:00");
      updateDeviceWorkInfo("ev-charger", "StopProvidingEnergy()", "09:00");
      await deployAndExecute("693021e575d1501dc7da3369", "TurnOffFreezer", FREEZER, {});
      updateDeviceModuleStatus(FREEZER, "freezer:TurnOffFreezer()");
      await deployAndExecute("6930221875d1501dc7da33c5", "StopWashing", "washing-machine", {});
      updateDeviceModuleStatus("washing-machine", "wm_module:StopWashing()");
      await deployAndExecute("693022a575d1501dc7da34a8", "StopProvidingEnergy", "ev-charger", {});
      updateDeviceModuleStatus("ev-charger", "ev_control:StopProvidingEnergy()");
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
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDayPlans(predefinedDayPlan3);
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan2]);
      await deployAndExecute("693021fc75d1501dc7da339b", "StartWashing", "washing-machine", {});
      updateDeviceModuleStatus("washing-machine", "wm_module:StartWashing()");
      updateDeviceWorkInfo("washing-machine", "StartWashing()", "10:00");
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
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

    // Reduce Cars battery for the period they are away
    if (currentHour >= 10 && currentHour < 18) {
      const startHour = 10;
      const currentTime = currentHour + (currentMinute / 60);
      const hoursElapsed = currentTime - startHour;

      // Car 1
      const startEnergy1 = 34.7;
      const rate = 2.5;
      const currentEnergy1 = Math.max(0, startEnergy1 - (hoursElapsed * rate));

      setElectricCar1(prev => ({
        ...prev,
        currentEnergy: Math.floor(currentEnergy1 * 10) / 10,
        dischargeableEnergy: Math.max(0, currentEnergy1 - 20) // Not plugged in
      }));

      // Car 2
      const startEnergy2 = 33.2;
      const currentEnergy2 = Math.max(0, startEnergy2 - (hoursElapsed * rate));

      setElectricCar2(prev => ({
        ...prev,
        currentEnergy: Math.floor(currentEnergy2 * 10) / 10,
        dischargeableEnergy: Math.max(0, currentEnergy2 - 20) // Not plugged in
      }));
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
      const coloredPlan3 = predefinedDayPlan3.map(device =>
        device.id === FREEZER
          ? { ...device, slots: device.slots.map(slot => ({ ...slot, color: "#f08989da" })) }
          : device
      );
      setHistoricalDayPlans(prev => [...prev, coloredPlan3]);
      runMoveCodeAnimation(ORCHESTRATOR, FREEZER, WasmWithOnnxScheduleIcon, null, sessionId);
      runMoveCodeAnimation(ORCHESTRATOR, WASHING_MACHINE, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      updateDeviceWorkInfo("washing-machine", "StopWashing()", "13:00");
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
      await deployAndExecute("6930221875d1501dc7da33c5", "StopWashing", "washing-machine", {});
      updateDeviceModuleStatus("washing-machine", "wm_module:StopWashing()");
    }

    if (currentHour == 15 && currentMinute === 0) {
      await deployAndExecute("693021fc75d1501dc7da339b", "StartWashing", "washing-machine", {});
      updateDeviceModuleStatus("washing-machine", "wm_module:StartWashing()");
      updateDeviceWorkInfo("washing-machine", "StartWashing()", "15:00");
    }

    if (currentHour == 17 && currentMinute === 0) {
      await deployAndExecute("6930221875d1501dc7da33c5", "StopWashing", "washing-machine", {});
      updateDeviceModuleStatus("washing-machine", "wm_module:StopWashing()");
      updateDeviceWorkInfo("washing-machine", "StopWashing()", "17:00");
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
      setHistoricalDayPlans(prev => [...prev, predefinedDayPlan4]);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
    }

    if ((currentHour == 20 && currentMinute === 0)) {
      await deployAndExecute("693021d475d1501dc7da3346", "TurnOnFreezer", FREEZER, {});
      updateDeviceModuleStatus(FREEZER, "freezer:TurnOnFreezer()");
      updateDeviceWorkInfo("freezer", "TurnOnFreezer()", "20:00");
    }

    if (currentHour == 22 && currentMinute === 0) {
      await deployAndExecute("693021e575d1501dc7da3369", "TurnOffFreezer", FREEZER, {});
      updateDeviceModuleStatus(FREEZER, "freezer:TurnOffFreezer()");
      updateDeviceWorkInfo("freezer", "TurnOffFreezer()", "22:00");
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
      const coloredPlan5 = predefinedDayPlan5.map(device =>
        device.id === EV_CHARGER
          ? { ...device, slots: device.slots.map(slot => ({ ...slot, color: "#f08989da" })) }
          : device
      );
      setHistoricalDayPlans(prev => [...prev, coloredPlan5]);
      runMoveCodeAnimation(ORCHESTRATOR, EV_CHARGER, WasmWithOnnxScheduleIcon, null, sessionId);
      if (animationSessionRef.current !== sessionId) return;
      await pauseAwareDelay(ANIMATION_MOVING_TIME, pausedRef, sessionId);
      setDemoRunning(true);
      setScheduleProcessing(false);
      handlePopOverClose();
      await deployAndExecute("6930224675d1501dc7da3403", "StartCharging", "ev-charger", {});
      updateDeviceModuleStatus("ev-charger", "ev_control:StartCharging()");
      updateDeviceWorkInfo("ev-charger", "StartCharging()", "21:00");
    }

    if (currentHour == 23 && currentMinute === 0) {
      await deployAndExecute("6930225a75d1501dc7da3437", "StopCharging", "ev-charger", {});
      updateDeviceModuleStatus("ev-charger", "ev_control:StopCharging()");
      updateDeviceWorkInfo("ev-charger", "StopCharging()", "23:00");
    }
    // Charge ElectricCars
    if (currentHour >= 21 && currentHour < 23) {
      const startHour = 21;
      const startingCharge1 = 15.1; // kWh
      const startingCharge2 = 13.6; // kWh
      const chargingRatePerHour = 7; // kWh per hour
      const hoursElapsed = (currentHour - startHour) + (currentMinute / 60);

      // Calculate current energy (starting charge + charged amount)
      const chargedAmount = hoursElapsed * chargingRatePerHour;
      const currentEnergyLevel1 = Math.min(startingCharge1 + chargedAmount, 60); // Cap at total capacity
      const currentEnergyLevel2 = Math.min(startingCharge2 + chargedAmount, 60); // Cap at total capacity
      const currentEnergy1 = Math.floor(currentEnergyLevel1);
      const currentEnergy2 = Math.floor(currentEnergyLevel2);

      // Available energy is current - minimum required (40 kWh)
      const minRequired = 20;
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
    // Reset device work info
    setDeviceWorkInfo({
      "freezer": [],
      "washing-machine": [],
      "ev-charger": [],
    });
    // Reset device module status
    updateDeviceModuleStatus("ev-charger", null);
    updateDeviceModuleStatus("washing-machine", null);
    updateDeviceModuleStatus(FREEZER, null);
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