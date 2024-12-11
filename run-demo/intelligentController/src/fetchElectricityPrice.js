// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import fetch from "node-fetch";
import fs from "fs/promises";

// API endpoints
const LATEST_PRICES_ENDPOINT =
  "https://api.porssisahko.net/v1/latest-prices.json";
const ONE_HOUR_PRICES =
  "https://api.porssisahko.net/v1/price.json?date=[date]&hour=[hour]";

// Function to fetch latest prices from the API
async function fetchLatestPrices() {
  try {
    const response = await fetch(LATEST_PRICES_ENDPOINT);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch latest prices: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    if (!data.prices || !Array.isArray(data.prices)) {
      return { prices: [] };
    }

    // Assign 'api' type to all prices fetched from the API
    const fixedPrices = data.prices.map((price) => ({
      ...price,
      type: "api",
    }));

    return { prices: fixedPrices };
  } catch (e) {
    if (e instanceof TypeError) {
      return { prices: [] };
    } else {
      console.error("Failed to fetch latest prices:", e);
      return { prices: [] };
    }
  }
}

async function fetchElectricityPriceForDateAndHour(date, hour) {
  const url = ONE_HOUR_PRICES.replace("[date]", date).replace("[hour]", hour);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch electricity price: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data.price;
  } catch (e) {
    if (e instanceof TypeError) {
      return undefined;
    } else {
      console.error("Failed to fetch electricity price:", e);
      return undefined; // Return undefined if error
    }
  }
}

function isPriceWithinDate(date, price) {
  return new Date(price.startDate) <= date && new Date(price.endDate) > date;
}

function sortPricesByDate(prices) {
  prices.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  return prices;
}

// Function to check if price exists for a certain date
function checkIfPriceExists(date, prices) {
  const matchingPriceEntry = prices.find(
    (price) =>
      new Date(price.startDate) <= date && new Date(price.endDate) > date
  );

  if (!matchingPriceEntry) {
    throw "Price for the requested date " + date + " is missing";
  }
  return matchingPriceEntry.price;
}

// Function to fetch missing price history between given dates
async function fetchMissingPriceHistory(startDate, endDate, priceData) {
  let currentHour = new Date(startDate);
  currentHour.setMinutes(0, 0, 0);
  currentHour.setHours(currentHour.getHours() - 2);
  const end = new Date(endDate);
  const updatedPriceData = [...priceData];

  // Loop through each hour between start and end dates
  while (currentHour <= end) {
    try {
      // Find if there's a price within the current hour
      const matchingPrice = updatedPriceData.find((price) =>
        isPriceWithinDate(currentHour, price)
      );
      if (!matchingPrice) {
        // If no price exists, fetch the electricity price for that hour
        const missingStart = new Date(currentHour);
        const missingEnd = new Date(currentHour);
        missingEnd.setHours(missingEnd.getHours() + 1);

        const year = missingStart.getFullYear();
        const month = (missingStart.getMonth() + 1).toString().padStart(2, "0");
        const day = missingStart.getDate().toString().padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        let fetchedPrice = await fetchElectricityPriceForDateAndHour(
          formattedDate,
          missingStart.getHours()
        );

        updatedPriceData.push({
          price: fetchedPrice !== undefined ? fetchedPrice : 5,
          startDate: missingStart,
          endDate: missingEnd,
          type: fetchedPrice !== undefined ? "api" : "fixed",
        });
      }
    } catch (e) {
      console.error("Error while fetching missing price history:", e);
      // Handle error here
    }
    currentHour.setHours(currentHour.getHours() + 1);
  }

  return sortPricesByDate(updatedPriceData);
}

// Function to forecast electricity prices for future dates
// The price is assumed to be the same that it was 24 hours ago
function forecastElectricityPrice(today, tomorrow, priceValues) {
  let start = new Date(today);
  start.setMinutes(0, 0, 0);
  let end = new Date(tomorrow);
  end.setHours(end.getHours() + 2);
  let updatedPriceValues = [...priceValues];

  while (start <= end) {
    try {
      checkIfPriceExists(start, updatedPriceValues);
    } catch (fetchError) {
      let missingStartDate = new Date(start);
      let missingEndDate = new Date(start);
      missingEndDate.setHours(missingEndDate.getHours() + 1);

      const previousDay = new Date(missingStartDate);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousPrice = updatedPriceValues.find(
        (price) =>
          new Date(price.startDate) <= previousDay &&
          new Date(price.endDate) > previousDay
      );

      if (previousPrice) {
        updatedPriceValues.push({
          price: previousPrice.price,
          startDate: missingStartDate,
          endDate: missingEndDate,
          type: "forecasted",
        });
      } else {
        updatedPriceValues.push({
          price: 5,
          startDate: missingStartDate,
          endDate: missingEndDate,
          type: "fixed",
        });
      }
    }
    start.setHours(start.getHours() + 1);
  }

  let sortedPriceValues = sortPricesByDate(updatedPriceValues);
  return sortedPriceValues;
}

async function checkAndFetchData(priceFileName) {
  // We need to fetch data for a 48 h time period.
  // 24 h to past (yesterday) and 24 h to future (tomorrow) from current time (today)
  const today = new Date();
  const yesterday = new Date(today - 3600000 * 24);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    let apiPrices = await fetchLatestPrices();
    if (!apiPrices.prices || apiPrices.prices.length === 0) {
      apiPrices = { prices: [] };
    }

    let filledPrices = await fetchMissingPriceHistory(
      yesterday,
      today,
      apiPrices.prices
    );

    if (!filledPrices || filledPrices.length === 0) {
      filledPrices = [];
    }

    const updatedPrices = forecastElectricityPrice(
      today,
      tomorrow,
      filledPrices
    );

    await fs.writeFile(priceFileName, JSON.stringify(updatedPrices, null, 2));

    let priceToday, priceYesterday, priceTomorrow;

    try {
      priceToday = checkIfPriceExists(today, updatedPrices);
      priceYesterday = checkIfPriceExists(yesterday, updatedPrices);
      priceTomorrow = checkIfPriceExists(tomorrow, updatedPrices);
    } catch (e) {
      if (priceToday === undefined) {
        console.error("Missing data for today: ", e);
      }
      if (priceYesterday === undefined) {
        console.error("Missing data for yesterday: ", e);
      }
      if (priceTomorrow === undefined) {
        console.error("Missing data for tomorrow: ", e);
      }
    }
  } catch (e) {
    console.error("Failed to fetch or process the price data: ", e);
  }
}

export default checkAndFetchData;
