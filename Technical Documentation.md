# Technical Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Project Structure](#3-project-structure)
4. [Creating WASM Modules](#4-creating-wasm-modules)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Key Files and Their Purpose](#6-key-files-and-their-purpose)
7. [CI/CD Pipeline](#7-cicd-pipeline)
8. [Troubleshooting](#8-troubleshooting)

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

To be added


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

## 5. Frontend Architecture
To be added

---

## 6. Key Files and Their Purpose

### Frontend Components

| File | Purpose |
|------|---------|
| `DemoControlls.jsx` | Main control hub; handles timeline, triggers device events, manages demo flow |
| `ArchitectureDiagram.jsx` | Visualizes system architecture with animated data flow |
| `ElectricityPrice.jsx` | Displays electricity price chart and consumption data |
| `OperatingTimeChart.jsx` | Shows device operating schedules |

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

## 7. CI/CD Pipeline
To be Added

---

## 9. API Reference

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

## 10. Contributing

1. Create a feature branch from `draft`
2. Make changes and test locally
3. Ensure all WASM modules compile successfully
4. Submit a pull request to `draft` for review
5. After approval, merge to `main` for production deployment

---

*Last Updated: December 2025*