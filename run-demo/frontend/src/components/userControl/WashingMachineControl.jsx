// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@mui/material";
import { WASHING_MACHINE } from '../../../constants';
import { convertToLocalTime } from '../../utils/timeUtils';

const WashinMachineControl = ({ onUserRequirementChange, optimizedTimeSlots }) => {
    const [datetime, setDatetime] = useState('');

    const handleInputChange = (event) => {
        setDatetime(event.target.value);
    };

    const handleWashingMachineSet = () => {
        const date = new Date(datetime);

        // Set time the user wants laubndry to be completed
        const dateTimeObject = {
            completeBefore: Math.floor(date.getTime() / 1000),
        }
        onUserRequirementChange(dateTimeObject, WASHING_MACHINE);
    };

    return (
      <div>
        <div>
          <label htmlFor="datetime">Washing should completed before : </label>
          <input
            type="datetime-local"
            id="datetime"
            value={datetime}
            onChange={handleInputChange}
          />
        </div>

        {optimizedTimeSlots[WASHING_MACHINE] && (
          <p>
            Optimized Schedule:{" "}
            {convertToLocalTime(optimizedTimeSlots[WASHING_MACHINE].startDate)}{" "}
            - {convertToLocalTime(optimizedTimeSlots[WASHING_MACHINE].endDate)}{" "}
            - {optimizedTimeSlots[WASHING_MACHINE].price}c/kWh
          </p>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleWashingMachineSet}
          sx={{
            fontSize: '0.6rem',
            height: '20px',
          }}
        >
          Set
        </Button>
      </div>
    );
};

WashinMachineControl.propTypes = {
    onUserRequirementChange: PropTypes.func.isRequired,
    optimizedTimeSlots: PropTypes.object.isRequired,
};

export default WashinMachineControl;
