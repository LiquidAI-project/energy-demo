// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { createContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { WITHOUT_LIQUID_AI } from "../../../constants";

const DemoControlContext = createContext({
  demoRunMethod: WITHOUT_LIQUID_AI,
  demoRunning: false,
  changeDemoRunMethod: () => {},
  setDemoRunning: () => {},
});

export const DemoControlProvider = ({ children }) => {
  const [demoRunMethod, setDemoRunMethod] = useState(WITHOUT_LIQUID_AI);
  const [demoRunning, setDemoRunning] = useState(false);

  // Change the demo run method (With liquid AI or without liquid AI)
  const changeDemoRunMethod = (method) => {
    setDemoRunMethod(method);
  };

  const value = useMemo(
    () => ({ demoRunMethod, demoRunning, changeDemoRunMethod, setDemoRunning }),
    [demoRunMethod, demoRunning]
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
