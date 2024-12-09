#!/bin/bash

# Function to stop a service given a port
stop_service_by_port() {
  port=$1
  echo "Stopping service(s) running on port $port..."

  # Get the PIDs of the processes using the given port
  pids=$(lsof -t -i:$port)

  if [ -n "$pids" ]; then
    # Loop through each PID and kill the processes
    for pid in $pids; do
      kill "$pid"
      echo "Killed process $pid running on port $port."
    done
  else
    echo "No service running on port $port."
  fi
}

# Stop the service running on port 3000 (Orchestrator service)
stop_service_by_port 3000

# Stop the service running on port 5173 (Frontend service)
stop_service_by_port 5173

# Stop the service running on port 3001 (Intelligent controller service)
stop_service_by_port 3001

echo "Both services stopped."
