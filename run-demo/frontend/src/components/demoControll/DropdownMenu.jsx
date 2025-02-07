// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { WITHOUT_LIQUID_AI, WITH_LIQUID_AI } from '../../../constants';
import { useDemoControlContext } from '../../context/demoControlContext/useDemoControlContext';

const DropdownMenu = () => {
  const { demoRunMethod, changeDemoRunMethod, setDemoTime } = useDemoControlContext();

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    changeDemoRunMethod(selectedValue);
    const resetDemoTime = new Date();
    resetDemoTime.setHours(0, 0, 0, 0);
    setDemoTime(resetDemoTime);
  };

  return (
    <div>
      <select value={demoRunMethod} onChange={handleChange}>
        <option value={WITHOUT_LIQUID_AI}>{WITHOUT_LIQUID_AI}</option>
        <option value={WITH_LIQUID_AI}>{WITH_LIQUID_AI}</option>
      </select>
    </div>
  );
};

export default DropdownMenu;
