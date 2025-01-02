// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

// Get the device ID map from local storage
export const getDeviceIdMap = () => {
  const storedDeviceMap = localStorage.getItem("deviceIdMap");
  if (!storedDeviceMap) {
    return null;
  }
  const deviceArray = JSON.parse(storedDeviceMap);
  return new Map(deviceArray);
};

// Get the device ID by name
export const getDeviceIdByName = (deviceName) => {
  const deviceIdMap = getDeviceIdMap();
  const deviceId = deviceIdMap ? deviceIdMap.get(deviceName) : null;
  return deviceId || null;
};

// Get the device name by ID
export const getDeviceNameById = (deviceId) => {
  const deviceIdMap = getDeviceIdMap();
  if (deviceIdMap) {
    for (const [deviceName, id] of deviceIdMap.entries()) {
      if (id === deviceId) {
        return deviceName;
      }
    }
  }
  return null;
};
