// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { hourlyEnergyData } from "../../assets/mockData/spotPrice";

const SpotPriceChart = () => {

  return (
    <>
      <Box sx={{ width: "100%", display: "flex" }}>
        <ResponsiveContainer width="92%" height={200}>
          <BarChart data={hourlyEnergyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="price" fill="#8884d8" name="Price (c/kWh)" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
};

export default SpotPriceChart;
