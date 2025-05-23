// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import activeIcon from "../../assets/active.png";
import EVChargerIcon from "../../assets/ev_charger.png";
import { EV_CHARGER } from "../../../constants";
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";

const evCharger = React.forwardRef((props, ref) => {
  const { deviceStatus } = useDemoVisualizationContext();
  const [blinkState, setBlinkState] = useState(false);

  const evChargerOn = deviceStatus.find((device) => device.deviceName === EV_CHARGER).isEnergyIntensive;

  const navigate = useNavigate();

  const component = {
    id: "evCharger",
    name: "Ev Charger",
    type: "consumer",
    description: "Electric cars are charged at the charging station.",
    optimize: false,
  };

  useEffect(() => {
    let intervalId;
  
    if (evChargerOn) {
      intervalId = setInterval(() => {
        setBlinkState((prevState) => !prevState);
      }, 500);
    } else {
      setBlinkState(false); 
      clearInterval(intervalId);
    }
  
    return () => clearInterval(intervalId);
  }, [evChargerOn]);

  const handleClick = () =>
    navigate(`/component/${component.id}`, {
      state: { component: component },
      replace: true,
    });

  return (
    <div>
      <button
        style={{
          position: "absolute",
          top: "52.2%",
          left: "80.35%",
          width: "4%",
          height: "4%",
          backgroundColor: "transparent",
          border: blinkState ? "5px solid red" : "5px solid green",
          borderRadius: "8px",
          transition: "border 0.2s",
          padding: "0%",
          zIndex: 2,
        }}
        onClick={handleClick}
      >
        <img
          id="evCharger"
          src={EVChargerIcon}
          alt="ecCharger"
          ref={ref}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </button>
      <img
        src={activeIcon}
        alt="active"
        style={{
          position: "absolute",
          top: "47.5%",
          left: "80%",
          width: "8%",
          height: "10%",
          transform: "scale(0.2)",
          zIndex: 2,
        }}
      />
    </div>
  );
});

evCharger.displayName = "evCharger";
export default evCharger;
