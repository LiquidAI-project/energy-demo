// Copyright 2024 Tampere University
// This software was developed as a part of the LiquidAI project
// This source code is licensed under the MIT license. See LICENSE in the repository root directory.
// Author(s): Lakshan Rathnayaka <lakshan.rathnayaka@tuni.fi>, Ville Heikkilä <ville.heikkila@tuni.fi>.

import { sendPostData } from "../services/apiService";

/**
 * Retrieves the device ID map from local storage.
 * The map is stored as a JSON string in the local storage under the key "deviceIdMap".
 * If no map is found, the function returns null.
 *
 * @returns {Map|null} - A Map object containing device names as keys and device IDs as values, or null if not found.
 */
export const getDeviceIdMap = () => {
  const storedDeviceMap = localStorage.getItem("deviceIdMap");
  if (!storedDeviceMap) {
    return null;
  }
  const deviceArray = JSON.parse(storedDeviceMap);
  return new Map(deviceArray);
};

/**
 * Retrieves the device ID by its name.
 * This function looks up the device ID in the device ID map stored in local storage.
 *
 * @param {string} deviceName - The name of the device whose ID needs to be retrieved.
 * @returns {string|null} - The device ID if found, or null if not found.
 */
export const getDeviceIdByName = (deviceName) => {
  const deviceIdMap = getDeviceIdMap();
  const deviceId = deviceIdMap ? deviceIdMap.get(deviceName) : null;
  return deviceId || null;
};

/**
 * Retrieves the device name by its ID.
 * This function searches through the device ID map to find the name corresponding to the given ID.
 *
 * @param {string} deviceId - The ID of the device whose name needs to be retrieved.
 * @returns {string|null} - The device name if found, or null if not found.
 */
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

/**
 * Checks if a device is currently operating based on the current plan and demo time.
 * This function checks if the current hour is within any of the device's operating slots.
 *
 * @param {string} deviceId - The ID of the device to check.
 * @param {Array} currentPlan - The list of device plans, each containing an ID and a list of operating slots.
 * @param {string} currentDemoTime - The current demo time as a string (e.g., "2025-02-12T14:00:00").
 * @returns {boolean} - True if the device is operating during the current demo time, false otherwise.
 */
export const isDeviceOperating = (deviceId, currentPlan, currentDemoTime) => {
  const devicePlan = currentPlan.find((plan) => plan.id === deviceId);
  const deviceOperationPlan = devicePlan ? devicePlan.slots : [];
  const currentHour = new Date(currentDemoTime).getHours();

  return deviceOperationPlan.some((slot) => {
    return currentHour >= slot.start && currentHour < slot.end;
  });
};

/**
 * Triggers a voiceover announcement using the Web Speech API.
 * This function is called whenever an action is performed or an event occurs,
 * providing auditory feedback to the user.
 *
 * @param {string} text - The message to be spoken aloud.
 */
export const speak = (text) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.3;
    utterance.pitch = 1.3;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0]; // or voices.find(voice => voice.name.includes('Female'))
    }
    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Speech Synthesis not supported in this browser.");
  }
};

/**
 * Calls deploy and execute APIs
 * This function is called when a IoT device has to start operating.
 *
 * @param {string} deploymentId - The deployment to be deployed and executed.
 * @param {string} deploymentName - The deployment name to be displayed.
 * @param {string} deviceName - The device name on which the deployment is executed.
 * @param {string} params - The data to be sent to execute API.
 * @param {string} sessionId - The id value to handle animations.
 */
export const deployAndExecute = async (deploymentId, deploymentName, deviceName, params) => {
  try {
    console.log(`Sending ${deploymentName} manifest deploy request`);
    const manifestRes = await sendPostData(`/file/manifest/${deploymentId}`);
    const status = Object.values(manifestRes.deviceResponses)
                  .find(d => d.deploymentId === deploymentId)
                  ?.status;
    if (status === "success") {
      console.log(`Sending ${deploymentName} execution request`);
      const execRes = await sendPostData(`/execute/${deploymentId}`, params);   
      if (execRes.result) {
        return "Success";
      } else {
        console.warn(`Manifest deployment failed, skipping to start ${deviceName}`);
        return `Manifest deployment failed, skipping to start ${deviceName}`;
      }
    } else {
      console.warn(`Module execution failed, ${deviceName} can not be started`);
      return `Module execution failed, ${deviceName} can not be started`;
    }
  } catch (err) {
    console.error("Request error:", err);
    return `Error: ${err.message || err}`;
  }
};
