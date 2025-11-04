// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { createContext, useMemo } from "react";
import PropTypes from "prop-types";
import { WITHOUT_LIQUID_AI } from "../../../constants";
import { useSyncedLocalStorage } from "../../services/SyncedLocalStorage";

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
});

export const DemoControlProvider = ({ children }) => {
  const [demoRunMethod, setDemoRunMethod] = useSyncedLocalStorage("demoRunMethod", "Without Liquid AI");
  const [demoRunning, setDemoRunning] = useSyncedLocalStorage("demoRunning", false);
  const [scheduleProcessing, setScheduleProcessing] = useSyncedLocalStorage("scheduleProcessing", false);
  const [demoTime, setDemoTime] = useSyncedLocalStorage("demoTime", new Date().setHours(0, 0, 0, 0));
  const [voiceEnabled, setVoiceEnabled] = useSyncedLocalStorage("voiceEnabled", false);
  const [demoStatus, setDemoStatus] = useSyncedLocalStorage("demoStatus", "idle"); // idle | running | stopped

  // Change the demo run method (With liquid AI or without liquid AI)
  const changeDemoRunMethod = (method) => {
    setDemoRunMethod(method);
  };

  const value = useMemo(
    () => ({ demoRunMethod, demoRunning, scheduleProcessing, demoTime, voiceEnabled, demoStatus, changeDemoRunMethod, setDemoRunning, setScheduleProcessing, setDemoTime, setVoiceEnabled, setDemoStatus }),
    [demoRunMethod, demoRunning, scheduleProcessing, demoTime, voiceEnabled, demoStatus]
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
