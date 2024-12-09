// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import fs from "fs/promises";

function convertDateToFinnishTime(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("fi-FI", { timeZone: "Europe/Helsinki" });
}

async function convertJsonToFinnishTime(priceFileName) {
  try {
    const data = await fs.readFile(priceFileName, "utf-8");
    const prices = JSON.parse(data);

    prices.forEach((entry) => {
      entry.startDate = convertDateToFinnishTime(entry.startDate);
      entry.endDate = convertDateToFinnishTime(entry.endDate);
    });

    await fs.writeFile(priceFileName, JSON.stringify(prices, null, 2));
  } catch (err) {
    console.error("Error converting and saving the data:", err);
  }
}

export default convertJsonToFinnishTime;
