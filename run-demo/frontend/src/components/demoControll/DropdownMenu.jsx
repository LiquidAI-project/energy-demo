// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { WITHOUT_LIQUID_AI, WITH_LIQUID_AI } from '../../../constants';
import { useDemoControlContext } from '../../context/demoControlContext/useDemoControlContext';
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

const DropdownMenu = ({ resetDemoTimer }) => {
  const { demoRunMethod, demoRunning, changeDemoRunMethod, setDemoStatus } = useDemoControlContext();
  

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    changeDemoRunMethod(selectedValue);
    setDemoStatus("idle");
    resetDemoTimer();
  };

  return (
    <Box sx={{ minWidth: 300 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-select-label">Choose Method</InputLabel>
        <Select
          labelId="demo-select-label"
          value={demoRunMethod}
          label="Choose Method"
          onChange={handleChange}
          disabled={demoRunning}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "4px",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ccc",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#888",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1976d2",
            },
          }}
        >
          <MenuItem value={WITHOUT_LIQUID_AI}>{WITHOUT_LIQUID_AI}</MenuItem>
          <MenuItem value={WITH_LIQUID_AI}>{WITH_LIQUID_AI}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default DropdownMenu;
