// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { useState } from 'react';
import PropTypes from 'prop-types';
import { WASHING_MACHINE } from '../../constants';

const UserControlUI = ({ onUserRequirementChange }) => {
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
            <h2>User Control UI</h2>
            <h3>Washing machine</h3>
            <div>
                <label htmlFor="datetime">Enter Date and Time:</label>
                <input
                    type="datetime-local"
                    id="datetime"
                    value={datetime}
                    onChange={handleInputChange}
                />
            </div>
            
            {datetime && <p>Selected Date and Time: {datetime}</p>}
            <button onClick={handleWashingMachineSet}>Set</button>
        </div>
    );
};

UserControlUI.propTypes = {
    onUserRequirementChange: PropTypes.func.isRequired,
};

export default UserControlUI;
