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
import { useSyncedLocalStorage } from "../../services/SyncedLocalStorage";

const createElectricCar = () => ({
  pluggedIn: false,
  provideEnergy: false,
  totalEnergy: 0,
  minReqEnergy: 80,
  availableEnergy: 0
});

const DemoVisualizationContext = createContext({
  hackerVisibility: false,
  movingDeployments: [],
  dayPlans: initialDayPlan,
  historicalDayPlans: [initialDayPlan],
  electricCar1: createElectricCar(),
  electricCar2: createElectricCar(),
  deviceStatus: [],
  changeHackerVisibility: () => { },
  setMovingDeployments: () => { },
  setDayPlans: () => { },
  setHistoricalDayPlans: () => { },
  setElectricCar1: () => { },
  setElectricCar2: () => { },
  setDeviceStatus: () => { },
});

export const DemoVisualizationProvider = ({ children }) => {
  const { demoTime } = useDemoControlContext();
  const [hackerVisibility, setHackerVisibility] = useState(false);
  const [movingDeployments, setMovingDeployments] = useState([]);
  const [dayPlans, setDayPlans] = useSyncedLocalStorage("dayPlans", initialDayPlan);
  const [historicalDayPlans, setHistoricalDayPlans] = useSyncedLocalStorage("historicalDayPlans", [initialDayPlan]);
  const [electricCar1, setElectricCar1] = useState(createElectricCar());
  const [electricCar2, setElectricCar2] = useState(createElectricCar());
  const [deviceStatus, setDeviceStatus] = useState([
    {
      supervisorName: 'ev-charger',
      deviceName: EV_CHARGER,
      isEnergyIntensive: false,

    },
    {
      supervisorName: 'washing-machine',
      deviceName: WASHING_MACHINE,
      isEnergyIntensive: false,
    },
    {
      supervisorName: 'freezer',
      deviceName: FREEZER,
      isEnergyIntensive: false,
    },
  ]);

  // Function to toggle the visibility of hacker Icon
  const changeHackerVisibility = (isHackerVisible) => {
    setHackerVisibility(isHackerVisible);
  };

  /*  useEffect(() => {
     const handleStorageChange = () => {
       console.log("change detected");
       const deviceIdMapRaw = JSON.parse(localStorage.getItem("deviceIdMap") || "[]");
       const deviceIdMap = deviceIdMapRaw.reduce((acc, [deviceName, supervisorId]) => {
         acc[deviceName] = supervisorId;
         return acc;
       }, {});
       setDeviceStatus((prevStatus) =>
         prevStatus.map((device) => ({
           ...device,
           isSupervisorDetected: deviceIdMap[device.supervisorName] ? true : false
         }))
       );
     };
     window.addEventListener("deviceIdMapChanged", handleStorageChange);
     return () => window.removeEventListener("deviceIdMapChanged", handleStorageChange);
   }, []); */

  useEffect(() => {
    /* setDeviceStatus([
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
    ]); */

    setDeviceStatus((prevStatus) =>
      prevStatus.map((device) => ({
        ...device,
        isEnergyIntensive: isDeviceOperating(device.deviceName, dayPlans, demoTime),
      }))
    );
  }, [dayPlans, demoTime]);

  const value = useMemo(
    () => ({
      hackerVisibility,
      movingDeployments,
      dayPlans,
      historicalDayPlans,
      electricCar1,
      electricCar2,
      deviceStatus,
      changeHackerVisibility,
      setMovingDeployments,
      setDayPlans,
      setHistoricalDayPlans,
      setElectricCar1,
      setElectricCar2,
      setDeviceStatus
    }),
    [
      hackerVisibility,
      movingDeployments,
      dayPlans,
      historicalDayPlans,
      electricCar1,
      electricCar2,
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
