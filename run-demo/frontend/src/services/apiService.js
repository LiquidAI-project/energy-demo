import axios from 'axios';

// Accessing the base URL from the .env file
// eslint-disable-next-line no-undef
const PUBLIC_HOST = process.env.PUBLIC_HOST;
// eslint-disable-next-line no-undef
const PUBLIC_PORT = process.env.PUBLIC_PORT;

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