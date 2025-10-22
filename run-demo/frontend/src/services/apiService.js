import axios from 'axios';

// Accessing the base URL from the .env file
// eslint-disable-next-line no-undef
const ORCHESTRATOR_HOST = import.meta.env.VITE_ORCHESTRATOR_HOST;
// eslint-disable-next-line no-undef
const ORCHESTRATOR_PORT = import.meta.env.VITE_ORCHESTRATOR_PORT;
// eslint-disable-next-line no-undef
// const INTELLIGENT_CONTROLLER_HOST = process.env.INTELLIGENT_CONTROLLER_HOST;
// eslint-disable-next-line no-undef
// const INTELLIGENT_CONTROLLER_PORT = process.env.INTELLIGENT_CONTROLLER_PORT;

// Function to fetch data
export const fetchData = async (param) => {
  try {
    const url = `${ORCHESTRATOR_HOST}:${ORCHESTRATOR_PORT}${param}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Function to send a POST request with form data
export const sendPostData = async (endpoint, data = {}) => {
  try {
    const url = `${ORCHESTRATOR_HOST}:${ORCHESTRATOR_PORT}${endpoint}`;
    // const formData = new URLSearchParams(data).toString();
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        //'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching POST data:', error);
    throw error;
  }
};

/*export const fetchIntelligentControllerData = async (endpoint, data = {}) => {
    try {
      const url = `${INTELLIGENT_CONTROLLER_HOST}:${INTELLIGENT_CONTROLLER_PORT}${endpoint}`;
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching POST data:', error);
      throw error;
    }
};*/