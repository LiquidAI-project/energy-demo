# 🔋 Energy Demo – Liquid AI Demonstrator

This repository contains the frontend implementation of a **Liquid AI-based energy optimization demonstrator**. The system simulates and visualizes how **intelligent, distributed, and privacy-preserving energy optimization** can be achieved in a household using Liquid AI principles, in contrast to traditional cloud-based optimization systems.

The demonstrator uses animated visualization and charts to help researchers, developers, and the general public understand how energy consumption can be dynamically scheduled based on real-time electricity prices, user behavior, and local device-level decisions.

The initial idea for the demonstrator was inspired by a previous project developed by a group of students as part of the Autumn 2023 implementation of the Software Engineering Project 1 and 2 courses at Tampere University. The source code from this earlier project, available in the GitHub repository https://github.com/LiquidAIDemo/LiquidAIDemo, served as a foundational reference.

---

## 🚀 System Overview

The application illustrates **two modes** of operation:

### 1. Traditional Cloud-Based Optimization
- Energy consumption data from household devices is sent to cloud servers.
- Optimization decisions are made externally and then pushed back to the house.
- This mode demonstrates:
  - **Data privacy risks**, including potential **data leakage to third parties or hackers**.
  - Limited adaptability due to centralized decision-making.
  - Delayed responses to sudden changes in price or user behavior.

### 2. Liquid AI-Based Optimization
- Optimization intelligence is **moved to the edge**, using **WebAssembly (WASM)** modules.
- The orchestrator sends intelligence (WASM) to local smart devices and controllers.
- The system adapts **in real-time** to:
  - **Spot electricity prices**
  - **Grid demand fluctuations**
  - **User comfort preferences**

This mode highlights:
- Privacy-preserving local decision-making
- Real-time responsiveness
- Dynamic scheduling of devices with updated energy use graphs

  
<img width="564" alt="Screenshot 2025-06-26 at 7 21 02 AM" src="https://github.com/user-attachments/assets/0072e62c-f3b8-4fce-859b-c65104577de3" />

---

## Running the setup in docker

For convenience there is a `run-demo/docker-compose.yml` and `run-demo/start.sh` scripts. The `start.sh` script will start the WasmIoT orchestrator ([`orchestrator`](http://localhost:3000)) and the energy demo UI ([`energy-demo`](http://localhost:5173)).

To start all or any service, run the following command:

```sh
./run-demo/start.sh
```

## Stopping Docker services

To stop and remove all or any service, run the following command:

```bash
./run-demo/stop.sh
```

## Running UI locally

You can simply run the demo UI locally with following command:

```sh
cd run-demo/frontend
npm start
```

## 🧱 Technologies Used

- **React 18.2.0** – UI framework
- **Vite** – Fast build and development server
- **Material UI (MUI)** – Component library for consistent styling
- **Framer Motion** – Smooth animation library
- **MUI X Charts** – Visualize energy schedules and spot price data
- **Docker & Docker Compose** – To run the demo UI in an isolated environment

---
