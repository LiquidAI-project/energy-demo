// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { createContext, useState, useMemo } from "react";
import PropTypes from "prop-types";

const DemoVisualizationContext = createContext({
  hackerVisibility: false,
  movingDeployments: [],
  changeHackerVisibility: () => {},
  setMovingDeployments: () => {},
});

export const DemoVisualizationProvider = ({ children }) => {
  const [hackerVisibility, setHackerVisibility] = useState(false);
  const [movingDeployments, setMovingDeployments] = useState([]);

  // Function to toggle the visibility of hacker Icon
  const changeHackerVisibility = (isHackerVisible) => {
    setHackerVisibility(isHackerVisible);
  };

  const value = useMemo(
    () => ({ hackerVisibility, movingDeployments, changeHackerVisibility, setMovingDeployments }),
    [hackerVisibility, movingDeployments]
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
