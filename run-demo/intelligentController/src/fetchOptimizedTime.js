// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

/**
 * Function to find the cheapest price within a given date and time range.
 * 
 * This function compares a given start and end date with the price data's time ranges 
 * to find the lowest price within the overlap of the provided range.
 * 
 * @param {Array} priceData - An array of price data objects. Each object should contain:
 *                             - `price`: The price at that time range.
 *                             - `startDate`: The start date of the time range in ISO format.
 *                             - `endDate`: The end date of the time range in ISO format.
 *                             - `type`: (optional) The type of pricing data.
 * @param {number} startDateTime - The start date and time in Unix timestamp format (seconds) (GMT).
 * @param {number} endDateTime - The end date and time in Unix timestamp format (seconds) (GMT).
 * 
 * @returns {Object|null} - Returns the object of which has the lowest price.
 *                          Returns `null` if no overlap is found.
 * 
 */
function getCheapestHour(priceData, startDateTime, endDateTime) {

    const selectedStartDate = new Date(startDateTime * 1000);
    const selectedEndDate = new Date(endDateTime * 1000);

    // Filter the data based on the selected start and end dates
    const filteredData = priceData.filter((item) => {
        const itemStartDate = new Date(item.startDate);
        const itemEndDate = new Date(item.endDate);

        return selectedStartDate < itemEndDate && selectedEndDate > itemStartDate;
    });

    if (filteredData.length === 0) {
        return null;
    }

    // Find the cheapest price from the filtered data
    const cheapestPriceItem = filteredData.reduce((cheapest, currentItem) => {
        return currentItem.price < cheapest.price ? currentItem : cheapest;
    });

    cheapestPriceItem.startDate = Math.floor(new Date(cheapestPriceItem.startDate).getTime() / 1000);
    cheapestPriceItem.endDate = Math.floor(new Date(cheapestPriceItem.endDate).getTime() / 1000);

    return cheapestPriceItem;
}

export default getCheapestHour;
