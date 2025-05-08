// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { createContext, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { initialDayPlan } from "../../assets/mockData/dailyPlan";
import { EV_CHARGER, WASHING_MACHINE, FREEZER } from "../../../constants";
import { isDeviceOperating } from "../../utils/deviceUtils";
import { useDemoControlContext } from "../demoControlContext/useDemoControlContext";

const DemoVisualizationContext = createContext({
  hackerVisibility: false,
  movingDeployments: [],
  dayPlans: initialDayPlan,
  ev1PluggedIn: true,
  ev2PluggedIn: true,
  deviceStatus: [],
  changeHackerVisibility: () => {},
  setMovingDeployments: () => {},
  setDayPlans: () => {},
  setEv1PluggedIn: () => {},
  setEv2PluggedIn: () => {},
  setDeviceStatus: () => {},
});

export const DemoVisualizationProvider = ({ children }) => {
  const { demoTime } = useDemoControlContext();
  const [hackerVisibility, setHackerVisibility] = useState(false);
  const [movingDeployments, setMovingDeployments] = useState([]);
  const [dayPlans, setDayPlans] = useState(initialDayPlan);
  const [ev1PluggedIn, setEv1PluggedIn] = useState(true);
  const [ev2PluggedIn, setEv2PluggedIn] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState([
    {
      deviceName: EV_CHARGER,
      isEnergyIntensive: false,
    },
    {
      deviceName: WASHING_MACHINE,
      isEnergyIntensive: false,
    },
    {
      deviceName: FREEZER,
      isEnergyIntensive: false,
    },
  ]);

  // Function to toggle the visibility of hacker Icon
  const changeHackerVisibility = (isHackerVisible) => {
    setHackerVisibility(isHackerVisible);
  };

  useEffect(() => {
    setDeviceStatus([
      {
        deviceName: EV_CHARGER,
        isEnergyIntensive: isDeviceOperating(EV_CHARGER, dayPlans, demoTime),
      },
      {
        deviceName: WASHING_MACHINE,
        isEnergyIntensive: isDeviceOperating(
          WASHING_MACHINE,
          dayPlans,
          demoTime
        ),
      },
      {
        deviceName: FREEZER,
        isEnergyIntensive: isDeviceOperating(FREEZER, dayPlans, demoTime),
      },
    ]);
  }, [dayPlans, demoTime]);

  const value = useMemo(
    () => ({
      hackerVisibility,
      movingDeployments,
      dayPlans,
      ev1PluggedIn,
      ev2PluggedIn,
      deviceStatus,
      changeHackerVisibility,
      setMovingDeployments,
      setDayPlans,
      setEv1PluggedIn,
      setEv2PluggedIn,
    }),
    [
      hackerVisibility,
      movingDeployments,
      dayPlans,
      ev1PluggedIn,
      ev2PluggedIn,
      deviceStatus,
    ]
  );

  return (
    <DemoVisualizationContext.Provider value={value}>
      {children}
    </DemoVisualizationContext.Provider>
  );
};
DemoVisualizationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DemoVisualizationContext;
