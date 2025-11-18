// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useState, createContext, useMemo } from "react";
import PropTypes from "prop-types";
import { useSyncedLocalStorage } from "../../services/SyncedLocalStorage";
import { ANIMATION_EVENT_SEQUENCE } from "../../assets/mockData/eventSequence";
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line no-undef
const ANIMATION_MOVING_TIME = import.meta.env.VITE_ANIMATION_MOVING_TIME;

const getInitialEventProgress = () => {
  //const saved = sessionStorage.getItem("eventProgress");
  //if (saved) return JSON.parse(saved);

  // Map all animation events to step:0, completed:false
  const initial = ANIMATION_EVENT_SEQUENCE.reduce((acc, event) => {
    acc[event.id] = { step: 1, completed: false };
    return acc;
  }, {});

  // Write it immediately to sessionStorage
  //sessionStorage.setItem("eventProgress", JSON.stringify(initial));
  return initial;
};
//progress: 0, startTime: null, pausedAt: 0,
const createEmptyAnimateLines = () => ({
  dbLine: { active: false, direction: "normalDir", icon: null, eventMsg: null, runId: 0 },
  icLine: { active: false, direction: "normalDir", icon: null, eventMsg: null, runId: 0 },
  freezerLine: { active: false, direction: "normalDir", icon: null, eventMsg: null, runId: 0 },
  evLine: { active: false, direction: "normalDir", icon: null, eventMsg: null, runId: 0 },
  wmLine: { active: false, direction: "normalDir", icon: null, eventMsg: null, runId: 0 },
});

const DemoControlContext = createContext({
  demoRunMethod: "Without Liquid AI",
  demoRunning: false,
  scheduleProcessing: false,
  demoTime: new Date().setHours(0, 0, 0, 0),
  voiceEnabled: false,
  demoStatus: "idle",
  changeDemoRunMethod: () => {},
  setDemoRunning: () => {},
  setDemoTime: () => {},
  setVoiceEnabled: () => {},
  setDemoStatus: () => {},

  // These variables are for the architecture view animations
  animateLines: createEmptyAnimateLines(),
  setAnimateLines: () => {},
  eventAnimationActive: false,
  setEventAnimationActive: () => {},
  runGlobalAnimation: async() => {},
  eventProgress: ANIMATION_EVENT_SEQUENCE.reduce((acc, event) => {
    acc[event.id] = { step: 1, completed: false };
    return acc;
  }, {}), 
  setEventProgress: () => {},
  resetArchitectutreAnimations:() => {}
});

export const DemoControlProvider = ({ children }) => {
  const [demoRunMethod, setDemoRunMethod] = useSyncedLocalStorage("demoRunMethod", "Without Liquid AI");
  const [demoRunning, setDemoRunning] = useSyncedLocalStorage("demoRunning", false);
  const [scheduleProcessing, setScheduleProcessing] = useSyncedLocalStorage("scheduleProcessing", false);
  const [demoTime, setDemoTime] = useSyncedLocalStorage("demoTime", new Date().setHours(0, 0, 0, 0));
  const [voiceEnabled, setVoiceEnabled] = useSyncedLocalStorage("voiceEnabled", false);
  const [demoStatus, setDemoStatus] = useSyncedLocalStorage("demoStatus", "idle"); // idle | running | stopped
  const [animateLines, setAnimateLines] = useState(createEmptyAnimateLines());
  const [eventProgress, setEventProgress] = useState(getInitialEventProgress); 
  const [eventAnimationActive, setEventAnimationActive] = useState(false);

  // Change the demo run method (With liquid AI or without liquid AI)
  const changeDemoRunMethod = (method) => {
    setDemoRunMethod(method);
  };

  const resetArchitectutreAnimations = () => {
    setEventProgress(getInitialEventProgress());
    setAnimateLines(createEmptyAnimateLines());
    setEventAnimationActive(false);
  };

  const runGlobalAnimation = async (lineDirectionValue, lineName, iconName, msg, pausedRef) => {
    const runId = uuidv4();
    setAnimateLines(prev => ({ 
      ...prev, 
      [lineName]: {
        active: true,
        direction: lineDirectionValue,
        icon: iconName,
        eventMsg: msg,
        runId
      }
    }));
    while (pausedRef.current) {
      await new Promise(resolve => setTimeout(resolve, 300)); // check every 300ms
    }
    await new Promise(resolve => setTimeout(resolve, ANIMATION_MOVING_TIME));
    while (pausedRef.current) {
      await new Promise(resolve => setTimeout(resolve, 300)); // check every 300ms
    }
    setAnimateLines(prev => ({
      ...prev,
      [lineName]: {
        ...prev[lineName],
        active: false,
      },
    }));
  }

    /* const runGlobalAnimation = async (direction, lineName, icon, msg, pausedRef) => {
      const runId = uuidv4();
      const line = animateLines[lineName] || { progress: 0, pausedAt: 0 };
    
      // Compute startTime only for this run
      let startTime = Date.now() - (line.progress || 0) * ANIMATION_MOVING_TIME;
    
      setAnimateLines(prev => ({
        ...prev,
        [lineName]: {
          active: true,
          progress: line.progress || 0,
          startTime,
          pausedAt: 0,
          direction,
          icon,
          eventMsg: msg,
          runId
        }
      }));
    
      return new Promise(resolve => {
        const step = () => {
          const now = Date.now();
    
          // If paused, just update pausedAt and don't change startTime
          if (pausedRef.current) {
            setAnimateLines(prev => ({
              ...prev,
              [lineName]: {
                ...prev[lineName],
                pausedAt: now - startTime
              }
            }));
            requestAnimationFrame(step);
            return;
          }
    
          // Adjust elapsed to include paused time
          const pausedTime = animateLines[lineName]?.pausedAt || 0;
          const elapsed = now - startTime - pausedTime;
          const progress = Math.min(elapsed / ANIMATION_MOVING_TIME, 1);
    
          setAnimateLines(prev => ({
            ...prev,
            [lineName]: {
              ...prev[lineName],
              progress,
              pausedAt: 0
            }
          }));
    
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            // Complete and reset
            setAnimateLines(prev => ({
              ...prev,
              [lineName]: {
                ...prev[lineName],
                active: false,
                progress: 0,
                pausedAt: 0
              }
            }));
            resolve();
          }
        };
    
        requestAnimationFrame(step);
      });
    }; */
    
    

  const value = useMemo(
    () => ({ eventProgress, animateLines, eventAnimationActive, demoRunMethod, demoRunning, scheduleProcessing, demoTime, voiceEnabled, demoStatus, changeDemoRunMethod, resetArchitectutreAnimations, runGlobalAnimation, setAnimateLines, setEventProgress, setEventAnimationActive, setDemoRunning, setScheduleProcessing, setDemoTime, setVoiceEnabled, setDemoStatus }),
    [eventProgress, animateLines, eventAnimationActive, demoRunMethod, demoRunning, scheduleProcessing, demoTime, voiceEnabled, demoStatus, runGlobalAnimation, resetArchitectutreAnimations, setAnimateLines, setEventProgress, setEventAnimationActive, setDemoRunning, setScheduleProcessing, setDemoTime, setVoiceEnabled, setDemoStatus]
  );
  return (
    <DemoControlContext.Provider value={value}>
      {children}
    </DemoControlContext.Provider>
  );
};

DemoControlProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DemoControlContext;