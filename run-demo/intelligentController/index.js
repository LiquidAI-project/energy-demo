// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import express from "express";
import fs from "fs/promises";
import cors from "cors";
import checkAndFetchData from "./src/fetchElectricityPrice.js";
import convertJsonToFinnishTime from "./src/convertToFinnishTime.js";
import getCheapestHour from "./src/fetchOptimizedTime.js";

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

const PRICES_FILE_UTC = "./data/prices_utc.json";
const PRICES_FILE_FINNISH_TIME = "./data/prices_finnish_time.json";

// Fetch the price data and convert to Finnish Time
async function updatePriceData() {
  try {
    await checkAndFetchData(PRICES_FILE_UTC);

    await convertJsonToFinnishTime(PRICES_FILE_UTC, PRICES_FILE_FINNISH_TIME);

    console.log("Price data updated.");
  } catch (e) {
    console.error(`Failed to fetch the latest price data: ${e}`);
  }
}

// Fetch and update price data when the server starts
updatePriceData();

app.get("/", async (req, res) => {
  try {
    const data = await fs.readFile(PRICES_FILE_FINNISH_TIME, "utf-8");
    const prices = JSON.parse(data);

    res.json(prices);
  } catch (e) {
    res.status(500).send("Error reading price data.", e);
  }
});

/**
 * @route POST /cheapestHour
 * @desc This endpoint returns the cheapest price within the specified time range.
 *       It filters the price data based on the given startDateTime and endDateTime,
 *       then returns the lowest price during that time period.
 * 
 * @param {number} startDateTime - The start of the time range as a Unix timestamp (in seconds).
 *                                  This defines the beginning of the time window for the search.
 * @param {number} endDateTime - The end of the time range as a Unix timestamp (in seconds).
 *                                This defines the end of the time window for the search.
 * 
 * @returns {Object} - A JSON object containing the cheapest price within the specified time range.
 *                     If no price is found in the range, the response will return null.
 * 
 */
app.post("/cheapestHour", async (req, res) => {

    const { startDateTime, endDateTime } = req.body;

    if (!startDateTime || !endDateTime) {
        return res.status(400).send("startData and endData are required.");
    }

    try {
        const priceData = await fs.readFile(PRICES_FILE_UTC, "utf-8");
        const prices = JSON.parse(priceData);
        const cheapestHourObj = getCheapestHour(prices, startDateTime, endDateTime);
        res.json(cheapestHourObj);
    } catch (e) {
        console.error("Error getting cheapest hour", e);
        res.status(500).send("Error getting cheapest hour");
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Update data every 59 minutes
setInterval(updatePriceData, 59 * 60 * 1000);
