// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import PropTypes from 'prop-types';

const DemoDataVisualize = ({logs}) => {
    return (
        <div>
            <h2>Logs</h2>
            <div style={{ height: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                {logs.map((log, index) => (
                    <pre key={index}>{log}</pre>
                ))}
            </div>
        </div>
    );
};

DemoDataVisualize.propTypes = {
    logs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default DemoDataVisualize;
