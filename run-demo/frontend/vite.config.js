/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  define: {
    'process.env': {
      PUBLIC_HOST: `${process.env.PUBLIC_HOST}`,
      PUBLIC_PORT: `${process.env.PUBLIC_PORT}`,
      DEVICE_CHECK_INTERVAL: `${process.env.DEVICE_CHECK_INTERVAL}`,
      // Add other environment variables here
    }
  }
})
