# Technical Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Project Structure](#3-project-structure)
4. [Creating WASM Modules](#4-creating-wasm-modules)
5. [Key Files and Their Purpose](#5-key-files-and-their-purpose)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [API Reference](#7-api-reference)
8. [Contributing](#8-contributing)
---

## 1. Project Overview

The **Energy Demo** project is a comprehensive demonstration of an intelligent energy management system powered by Liquid AI. It showcases how various smart devices—such as Electric Vehicle (EV) chargers, freezers, and washing machines—can be orchestrated to optimize energy consumption based on real-time data, such as electricity prices and user demand.

The system utilizes **WebAssembly (WASM)** modules to control individual devices, allowing for portable, secure, and efficient execution of control logic. A React-based frontend visualizes the system's architecture, device states, and energy flow, providing an interactive interface for the demo.

### Key Features
- **Real-time Energy Optimization**: Dynamically adjusts device schedules based on electricity prices
- **Vehicle-to-Grid (V2G) Support**: Electric vehicles can provide energy back to home devices
- **Interactive Visualization**: Animated architecture diagram showing data flow between components
- **Modular Device Control**: Each device is controlled by its own WASM module
- **Energy Consumption & Price Calculation**: Tracks device energy usage and calculates costs based on real-time electricity prices

### System Components
| Component | Description |
|-----------|-------------|
| Database | MongoDB storage for modules, manifests, and deployment data |
| Orchestrator | Central hub that manages WASM module deployment and execution |
| Intelligent Control | Analyzes electricity prices and generates optimal schedules |
| Flexibility Service | Monitors electricity prices and triggers schedule recalculations |
| Electricity Provider | External service providing real-time electricity pricing data |
| Supervisors | Edge devices that execute WASM modules locally |
| Frontend | React-based visualization and control interface |

---

## 2. Development Environment Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Rust** | Latest stable | Compiling WASM modules |
| **Node.js** | 18.x LTS or higher (v24.4.1 was used for development)| Frontend |
| **npm** | 9.x or higher | Package management |
| **wasmtime** | Latest | Testing WASM modules locally |
| **Docker** | Latest | Containerization platform for deploying and running orchestrator and supervisors |

### Server Setup

This section describes how to set up the energy demo on a production server.

#### Basic Requirements

- **Docker**: Required for running all backend services
- **SSH Access**: For GitHub Actions deployment, the server must have SSH access available with a user account that belongs to the `docker` group

#### Container Architecture

The energy demo requires the following Docker containers:

| Container | Description |
|-----------|-------------|
| Orchestrator | Central hub managing WASM module deployment and execution |
| Supervisor 1 | Edge device executing EV charger module |
| Supervisor 2 | Edge device executing freezer module |
| Supervisor 3 | Edge device executing washing machine module |
| MongoDB | Database for storing modules, manifests, and deployment data |
| mongo-express (optional) | Web-based MongoDB admin interface for easier database inspection |

#### Setup Steps

1. **Clone the wasmiot-test-env repository**
   ```bash
   git clone https://github.com/LiquidAI-project/wasmiot-test-env.git
   cd wasmiot-test-env
   git checkout 6f75891c122914fd322ae07d6e1c9cf7f55f8622
   ```

2. **Configure environment variables**
   - Modify the `.env` file with appropriate values for your server

3. **Create Docker Compose configuration**
   - Create a `compose-demo.yml` file with the required container definitions
   - This file defines the orchestrator, supervisors, MongoDB, and optionally mongo-express

4. **Build and start containers**
   ```bash
   # Copy environment file for Rust orchestrator
   cp .env ./orchestrator-rust-port/.env
   
   # Build images and start containers
   docker compose -f compose-demo.yml up --detach
   ```

#### Network Configuration (Nginx Proxy)

The server uses an Nginx reverse proxy to direct HTTPS traffic to the appropriate container ports:

- Nginx runs as a Docker container
- Configuration redirects HTTPS addresses to localhost ports
- Relevant configuration is stored in `energy-demo-nginx-configurations.conf`
- **SSL Certificates**: Uses Let's Encrypt certificates (require renewal every 90 days)

**Updating Nginx Configuration:**
1. Update the configuration file
2. Stop and remove the Nginx container
3. Restart the Nginx container

#### GitHub Actions Requirements

For CI/CD deployment to work:
- Repository secrets must be configured correctly
- The frontend is built and deployed as a Docker container via GitHub Actions
- SSH credentials must allow the GitHub Action runner to connect and execute Docker commands

#### Running the frontend locally

#### 1. Clone the Repository
```bash
git clone https://github.com/LiquidAI-project/energy-demo.git
cd energy-demo
```

#### 2. Frontend Setup
```bash
cd run-demo/frontend
npm install
```

#### 3. Environment Configuration
Create a `.env` file in `run-demo/frontend/` with the following variables:
```env
VITE_ORCHESTRATOR_HOST=https://your-orchestrator-host
VITE_ORCHESTRATOR_PORT=443
VITE_ANIMATION_MOVING_TIME=2000
VITE_DEVICE_CHECK_INTERVAL=5000
VITE_DEV_VERSION=true
```

#### 4. Running the Development Server
```bash
cd run-demo/frontend
npm run dev
```

---

## 3. Project Structure

```
energy-demo/
├── .github/
│   └── workflows/           # CI/CD pipeline configurations
│       ├── main_demo.yml    # Production deployment workflow
│       └── draft_demo.yml   # Draft/staging deployment workflow
├── modules/                 # WASM module source code
│   ├── ev_control/          # EV charger control module
│   ├── freezer_module/      # Freezer control module
│   ├── wm_module/           # Washing machine control module
├── run-demo/
│   └── frontend/            # React frontend application
│       ├── src/
│       │   ├── assets/      # Images, icons, mock data
│       │   ├── components/  # React components
│       │   ├── context/     # React context providers
│       │   ├── services/    # API service functions
│       │   └── utils/       # Utility functions
│       ├── Dockerfile       # Container configuration
│       └── package.json     # Node.js dependencies
├── LICENSE
├── README.md
└── Technical Documentation.md
```

---

## 4. Creating WASM Modules

The core logic for devices is encapsulated in Rust modules compiled to WebAssembly. The module creation process follows the structure and guidelines from the [wasmiot-modules](https://github.com/LiquidAI-project/wasmiot-modules) repository.

### Module Structure
Each module (e.g., in `modules/`) typically contains:
```
module_name/
├── Cargo.toml    # Rust package configuration
└── src/
    └── lib.rs    # Module source code
```
*   `Cargo.toml`: Defines dependencies (e.g., `serde`) and crate type (`cdylib` for WASM).
*   `src/lib.rs`: The Rust source code containing the control logic and exported functions.

### Step-by-Step Guide

#### 1. Create a New Module
```bash
cd modules
cargo new --lib my_new_module
cd my_new_module
```
#### 2. Configure Cargo.toml
Add the following to your `Cargo.toml` to ensure it compiles to a dynamic system library suitable for WASM:
```toml
[package]
name = "my_new_module"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
serde = { version = "1.0", features = ["derive"] }
```
#### 3. Write the Module Logic
```rust
// src/lib.rs

// Internal state
static mut IS_ACTIVE: i32 = 0;

// Control functions
#[no_mangle]
pub extern "C" fn turn_on() {
    unsafe { IS_ACTIVE = 1; }
}

#[no_mangle]
pub extern "C" fn turn_off() {
    unsafe { IS_ACTIVE = 0; }
}

#[no_mangle]
pub extern "C" fn is_active() -> i32 {
    unsafe { IS_ACTIVE }
}

// Main entry point for orchestrator
#[no_mangle]
pub extern "C" fn execute_event(event_id: i32, param1: i32) -> i32 {
    match event_id {
        1 => { turn_on(); is_active() }
        2 => { turn_off(); is_active() }
        3 => is_active(),
        _ => -1,
    }
}
```

#### 4. Build the Module
```bash
cargo build --target wasm32-unknown-unknown --release
```
The compiled `.wasm` file will be in `target/wasm32-unknown-unknown/release/`.

#### 5. Test Locally with wasmtime
```bash
wasmtime --invoke execute_event target/wasm32-unknown-unknown/release/my_new_module.wasm 1 0
```

---

## 5. Key Files and Their Purpose

### Frontend Components

| File | Purpose |
|------|---------|
| `Demo.jsx` | Main demo component; orchestrates the entire demo flow |
| `DemoControlls.jsx` | Main control hub; handles timeline, triggers device events, manages demo flow |
| `ArchitectureDiagram.jsx` | Visualizes system architecture with animated data flow |
| `ElectricityPrice.jsx` | Displays electricity price chart and consumption data |
| `OperatingTimeChart.jsx` | Shows device operating schedules |
| `DemoClock.jsx` | Displays the current time and date |

### State Management

| File | Purpose |
|------|---------|
| `demoControlContext.jsx` | Manages state and data for running the demo timer and play/puase states |
| `demoVisualizationContext.jsx` | Manages state and data for visuals e.g., devices, prices, consumption, etc. |

### Data Files

| File | Purpose |
|------|---------|
| `eventSequence.js` | Defines animation events triggered at specific times for architecture view |
| `dailyPlan.js` | Contains device schedules and energy consumption plans |

### Utility Files

| File | Purpose |
|------|---------|
| `deviceUtils.js` | Functions for API calls to orchestrator (`deploy`, `execute`) |
| `apiService.js` | Axios-based HTTP client for orchestrator communication |

### WASM Modules

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `ev_control` | EV charger management | `start_charging()`, `stop_charging()`, `get_battery_status()` |
| `freezer_module` | Freezer control | `turn_on()`, `turn_off()`, `get_consumed_energy()` |
| `wm_module` | Washing machine control | `start_washing()`, `stop_washing()`, `get_consumed_energy()` |

---

## 6. CI/CD Pipeline

### Workflows

#### Production Deployment (`main_demo.yml`)
- **Trigger**: Push to `main` branch or manual dispatch
- **Steps**:
  1. Build Docker image for frontend
  2. Push to GitHub Container Registry
  3. SSH to production server
  4. Pull and deploy new container
  5. Health check verification

#### Draft Deployment (`draft_demo.yml`)
- **Trigger**: Push to `draft` branch or manual dispatch
- Similar to production but deploys to staging environment

### Required Secrets
```
SERVER_HOST              # Deployment server hostname
SERVER_USERNAME          # SSH username
SERVER_SSH_PORT          # SSH port
SERVER_SSH_PRIVATE_KEY   # SSH private key
SERVER_SSH_PASSPHRASE    # SSH key passphrase
GITHUB_TOKEN             # GitHub token for container registry access
SERVER_MAIN_CONTAINER_NAME # Container name for main deployment
SERVER_DRAFT_CONTAINER_NAME # Container name for draft deployment
VITE_ORCHESTRATOR_HOST   # Orchestrator URL
VITE_ORCHESTRATOR_PORT   # Orchestrator port
VITE_PUBLIC_HOST         # Public host
VITE_PUBLIC_PORT         # Public port
VITE_ANIMATION_MOVING_TIME # Animation moving time
VITE_DEVICE_CHECK_INTERVAL # Device check interval
VITE_ALLOWED_HOSTS # Allowed hosts
VITE_DEV_VERSION # Development version
SERVER_MAIN_FRONTEND_PORT # Main frontend port
SERVER_DRAFT_FRONTEND_PORT # Draft frontend port
SERVER_FRONTEND_INTERNAL_PORT # Frontend internal port
```
---

## 7. API Reference

### Orchestrator Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/file/module` | GET | List all uploaded modules |
| `/file/manifest` | GET | List all deployment manifests |
| `/file/module/:id` | GET | Get a single module details |
| `/file/manifest/:id` | GET | Get a single manifest details |
| `/file/manifest/:deploymentId`| POST | Deploy a manifest |
| `/execute/:deploymentId`| POST | Execute a manifest |

### Module Execution
```javascript
// Example: Execute an event on EV charger
await execute(`${deployment_id}`, "ev-charger", {
  param0: 4,  // event_id: get_battery_status
  param1: 2,  // hour
  param2: 30, // minute
  param3: 1   // car_id
});
```

---

## 8. Contributing

1. Create a feature branch from `draft`
2. Make changes and test locally
3. Ensure all WASM modules compile successfully
4. Submit a pull request to `draft` for review
5. After approval, merge to `main` for production deployment

---

*Last Updated: December 2025*