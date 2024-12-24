// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useState } from 'react';
import { WITHOUT_LIQUID_AI, WITH_LIQUID_AI } from '../../../constants';
import PropTypes from "prop-types";

const DropdownMenu = ({ onRunMethodSelect }) => {
  const [selectedOption, setSelectedOption] = useState(WITHOUT_LIQUID_AI);

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue);
    onRunMethodSelect(selectedValue);
  };

  return (
    <div>
      <select value={selectedOption} onChange={handleChange}>
        <option value={WITH_LIQUID_AI}>{WITH_LIQUID_AI}</option>
        <option value={WITHOUT_LIQUID_AI}>{WITHOUT_LIQUID_AI}</option>
      </select>
    </div>
  );
};

DropdownMenu.propTypes = {
    onRunMethodSelect: PropTypes.func.isRequired,
};

export default DropdownMenu;
