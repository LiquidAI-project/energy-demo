// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { createContext, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { initialDayPlan } from "../../assets/mockData/dailyPlan";

const DemoVisualizationContext = createContext({
  hackerVisibility: false,
  movingDeployments: [],
  dayPlans: initialDayPlan,
  evChargerOn: false,
  washingMachineOn: false,
  freezerMaxOn: false,
  ev1PluggedIn: true,
  ev2PluggedIn: true,
  changeHackerVisibility: () => {},
  setMovingDeployments: () => {},
  setDayPlans: () => {},
  setEvChargerOn: () => {},
  setWashingMachineOn: () => {},
  setFreezerMaxOn: () => {},
  setEv1PluggedIn: () => {},
  setEv2PluggedIn: () => {},
});

export const DemoVisualizationProvider = ({ children }) => {
  const [hackerVisibility, setHackerVisibility] = useState(false);
  const [movingDeployments, setMovingDeployments] = useState([]);
  const [dayPlans, setDayPlans] = useState(initialDayPlan);
  const [evChargerOn, setEvChargerOn] = useState(false);
  const [washingMachineOn, setWashingMachineOn] = useState(false);
  const [freezerMaxOn, setFreezerMaxOn] = useState(false);
  const [ev1PluggedIn, setEv1PluggedIn] = useState(true);
  const [ev2PluggedIn, setEv2PluggedIn] = useState(true);

  // Function to toggle the visibility of hacker Icon
  const changeHackerVisibility = (isHackerVisible) => {
    setHackerVisibility(isHackerVisible);
  };

  const value = useMemo(
    () => ({
      hackerVisibility,
      movingDeployments,
      dayPlans,
      evChargerOn,
      washingMachineOn,
      freezerMaxOn,
      ev1PluggedIn,
      ev2PluggedIn,
      changeHackerVisibility,
      setMovingDeployments,
      setDayPlans,
      setEvChargerOn,
      setWashingMachineOn,
      setFreezerMaxOn,
      setEv1PluggedIn,
      setEv2PluggedIn,
    }),
    [
      hackerVisibility,
      movingDeployments,
      dayPlans,
      evChargerOn,
      washingMachineOn,
      freezerMaxOn,
      ev1PluggedIn,
      ev2PluggedIn,
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
