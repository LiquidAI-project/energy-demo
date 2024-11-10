#!/bin/bash

# Start orchestrator in background with nohup
echo "Starting the orchestrator service..."
cd ./wasmiot-orchestrator/fileserv || { echo "Failed to navigate to ./wasmiot-orchestrator/fileserv"; exit 1; }
nohup bash -c "npm install && npm start" > orchestrator.log 2>&1 &

# Start frontend in background with nohup
echo "Starting the frontend service..."
cd ../../frontend || { echo "Failed to navigate to ./frontend"; exit 1; }
nohup bash -c "npm install && npm start" > frontend.log 2>&1 &

echo "Both projects started in background."