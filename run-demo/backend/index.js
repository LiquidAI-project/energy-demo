// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import express from "express";
import fs from "fs/promises";
import cors from "cors";
import checkAndFetchData from "./src/fetchElectricityPrice.js";
import convertJsonToFinnishTime from "./src/convertToFinnishTime.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

const PRICES_FILE = "./data/prices.json";

// Fetch the price data and convert to Finnish Time
async function updatePriceData() {
  try {
    await checkAndFetchData(PRICES_FILE);

    await convertJsonToFinnishTime(PRICES_FILE);

    console.log("Price data updated.");
  } catch (e) {
    console.error(`Failed to fetch the latest price data: ${e}`);
  }
}

// Fetch and update price data when the server starts
updatePriceData();

app.get("/", async (req, res) => {
  try {
    const data = await fs.readFile(PRICES_FILE, "utf-8");
    const prices = JSON.parse(data);

    res.json(prices);
  } catch (e) {
    res.status(500).send("Error reading price data.", e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Update data every 59 minutes
setInterval(updatePriceData, 59 * 60 * 1000);
