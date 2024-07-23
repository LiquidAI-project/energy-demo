import axios from 'axios';

// Accessing the base URL from the .env file
const PUBLIC_HOST = process.env.PUBLIC_HOST;
const PUBLIC_PORT = process.env.PUBLIC_PORT;

// Function to fetch data
export const fetchData = async () => {
  try {
    const url = `${PUBLIC_HOST}:${PUBLIC_PORT}/device/logs`;
    console.log('Request URL:', url); // Log the constructed URL for debugging
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};