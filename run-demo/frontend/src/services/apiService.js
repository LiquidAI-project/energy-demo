import axios from 'axios';

// eslint-disable-next-line no-undef
const ORCHESTRATOR_HOST = import.meta.env.VITE_ORCHESTRATOR_HOST;
// eslint-disable-next-line no-undef
const ORCHESTRATOR_PORT = import.meta.env.VITE_ORCHESTRATOR_PORT;

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