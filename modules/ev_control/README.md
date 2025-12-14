# EV Control Module

A simple WebAssembly module providing stub functions for electric vehicle control operations.

## Functions

- `enable_vehicle2home(value: i32) -> i32` - Stub function for enabling vehicle-to-home functionality
- `enable_grid2vehicle(value: i32) -> i32` - Stub function for enabling grid-to-vehicle functionality

Both functions currently return the input value unchanged.

## Prerequisites

### Installing Rust

If you don't have Rust installed, you can install it using `rustup`:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal or run:
```bash
source $HOME/.cargo/env
```

Verify the installation:
```bash
rustc --version
cargo --version
```

### Installing WebAssembly Target

This module needs to be compiled for WebAssembly. Install the `wasm32-unknown-unknown` target:

```bash
rustup target add wasm32-unknown-unknown
```

Verify the target is installed:
```bash
rustup target list --installed
```

You should see `wasm32-unknown-unknown` in the list.

## Building the Module

Navigate to the module directory:

```bash
cd ev_control
```

Build the module in release mode:

```bash
cargo build --target wasm32-unknown-unknown --release
```

The compiled WebAssembly binary will be located at:
```
target/wasm32-unknown-unknown/release/ev_control.wasm
```

## Development

For development builds (faster compilation, larger binary):

```bash
cargo build --target wasm32-unknown-unknown
```

The debug binary will be at:
```
target/wasm32-unknown-unknown/debug/ev_control.wasm
```

## Project Structure

```
ev_control/
├── Cargo.toml          # Rust project configuration
├── src/
│   └── lib.rs          # Module source code
└── README.md           # This file
```

