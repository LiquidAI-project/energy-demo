// ===========================================
// Freezer IoT Device WASM Module (Rust)
// Minimal, no wasm-bindgen, C-ABI compatible
// ===========================================

use core::sync::atomic::{AtomicI32, AtomicI64, Ordering};

// --------------------------
// Internal state variables
// --------------------------

static TARGET_TEMPERATURE: AtomicI32 = AtomicI32::new(-18);
static CURRENT_MODE: AtomicI32 = AtomicI32::new(0); // 0=normal,1=eco,2=rapid freeze
static RUNNING: AtomicI32 = AtomicI32::new(1);      // 1=on,0=off

static INTERNAL_TEMP: AtomicI32 = AtomicI32::new(-17);
static EXTERNAL_TEMP: AtomicI32 = AtomicI32::new(22);
static HUMIDITY: AtomicI32 = AtomicI32::new(40);
static DOOR_STATUS: AtomicI32 = AtomicI32::new(0); // 0=closed,1=open
static POWER_USAGE: AtomicI32 = AtomicI32::new(120); // watts
static COMPRESSOR_CYCLES: AtomicI32 = AtomicI32::new(0);
static RUNTIME_HOURS: AtomicI64 = AtomicI64::new(150); // example

// ===============================
// 1. BASIC CONTROL FUNCTIONS
// ===============================

#[unsafe(no_mangle)]
pub extern "C" fn set_temperature(temp: i32) {
    TARGET_TEMPERATURE.store(temp, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn get_temperature() -> i32 {
    TARGET_TEMPERATURE.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn set_mode(mode: i32) {
    CURRENT_MODE.store(mode, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn get_mode() -> i32 {
    CURRENT_MODE.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn turn_on() {
    RUNNING.store(1, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn turn_off() {
    RUNNING.store(0, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn is_running() -> i32 {
    RUNNING.load(Ordering::SeqCst)
}

// ===============================
// 2. SENSOR & TELEMETRY FUNCTIONS
// ===============================

#[unsafe(no_mangle)]
pub extern "C" fn get_internal_temp() -> i32 {
    INTERNAL_TEMP.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn get_external_temp() -> i32 {
    EXTERNAL_TEMP.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn get_humidity() -> i32 {
    HUMIDITY.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn get_door_status() -> i32 {
    DOOR_STATUS.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn get_power_usage() -> i32 {
    POWER_USAGE.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn get_compressor_cycles() -> i32 {
    COMPRESSOR_CYCLES.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn get_runtime_hours() -> i64 {
    RUNTIME_HOURS.load(Ordering::SeqCst)
}
