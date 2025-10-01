import axios from 'axios';

// Accessing the base URL from the .env file
// eslint-disable-next-line no-undef
const PUBLIC_HOST = import.meta.env.VITE_PUBLIC_HOST;
// eslint-disable-next-line no-undef
const PUBLIC_PORT = import.meta.env.VITE_PUBLIC_PORT;
// eslint-disable-next-line no-undef
const INTELLIGENT_CONTROLLER_HOST = process.env.INTELLIGENT_CONTROLLER_HOST;
// eslint-disable-next-line no-undef
const INTELLIGENT_CONTROLLER_PORT = process.env.INTELLIGENT_CONTROLLER_PORT;

// Function to fetch data
export const fetchData = async (param) => {
  try {
    const url = `${PUBLIC_HOST}:${PUBLIC_PORT}${param}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Function to send a POST request with form data
export const fetchPostData = async (endpoint, data = {}) => {
  try {
    const url = `${PUBLIC_HOST}:${PUBLIC_PORT}${endpoint}`;

    const formData = new URLSearchParams(data).toString();

    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching POST data:', error);
    throw error;
  }
};

export const fetchIntelligentControllerData = async (endpoint, data = {}) => {
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
};