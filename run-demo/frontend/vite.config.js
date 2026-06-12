/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Parse the allowed hosts from the environment variable
const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(',')
  : [];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    noDiscovery: true,
    exclude: [
      '@emotion/react',
      '@emotion/styled',
      '@mui/icons-material',
      '@mui/material',
      '@mui/styled-engine',
      '@mui/system',
    ],
  },
  legacy: {
    inconsistentCjsInterop: true,
  },
  server: {
    allowedHosts: allowedHosts,
    host: '0.0.0.0',
    port: 5173,
  },
  define: {
    'process.env': {
      ANIMATION_MOVING_TIME: `${process.env.ANIMATION_MOVING_TIME}`,
      VITE_DEV_VERSION: `${process.env.VITE_DEV_VERSION}`,
      // Add other environment variables here
    }
  }
})
