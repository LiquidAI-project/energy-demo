// ===========================================
// Washing Machine IoT WASM Module (Rust)
// C-ABI compatible
// ===========================================

use core::sync::atomic::{AtomicI32, AtomicI64, Ordering};

// --------------------------
// Internal state variables
// --------------------------

// Operational state
static RUNNING: AtomicI32 = AtomicI32::new(0);      // 0=off, 1=on
static MODE: AtomicI32 = AtomicI32::new(0);         // 0=normal, 1=eco, 2=quick, etc.

// Energy tracking (in hundredths of kWh)
static ENERGY_USED: AtomicI64 = AtomicI64::new(0);  
static POWER_RATING: AtomicI32 = AtomicI32::new(2000); // watts

// Cycle tracking
static CYCLES_COMPLETED: AtomicI32 = AtomicI32::new(0);

// --------------------------
// 1. BASIC CONTROL FUNCTIONS
// --------------------------

#[unsafe(no_mangle)]
pub extern "C" fn start_washing() {
    RUNNING.store(1, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn stop_washing() {
    RUNNING.store(0, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn is_running() -> i32 {
    RUNNING.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn set_mode(mode: i32) {
    MODE.store(mode, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn get_mode() -> i32 {
    MODE.load(Ordering::SeqCst)
}

// --------------------------
// 2. ENERGY MANAGEMENT
// --------------------------

// Simulate energy consumption for a given duration in hours
#[unsafe(no_mangle)]
pub extern "C" fn consume_energy(duration_hours_hundredths: i64) -> i64 {
    // duration_hours_hundredths is in hundredths of hours (e.g., 150 = 1.50 h)
    let power_watts = POWER_RATING.load(Ordering::SeqCst);
    let energy_kwh = (power_watts as i64 * duration_hours_hundredths) / 100_000; 
    // divide by 1000 for kW, and by 100 for hundredths of hours

    ENERGY_USED.fetch_add(energy_kwh, Ordering::SeqCst);
    ENERGY_USED.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn get_energy_used() -> i64 {
    ENERGY_USED.load(Ordering::SeqCst)
}

#[unsafe(no_mangle)]
pub extern "C" fn set_power_rating(power_watts: i32) {
    POWER_RATING.store(power_watts, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn get_power_rating() -> i32 {
    POWER_RATING.load(Ordering::SeqCst)
}

// --------------------------
// 3. CYCLE MANAGEMENT
// --------------------------

#[unsafe(no_mangle)]
pub extern "C" fn complete_cycle() {
    CYCLES_COMPLETED.fetch_add(1, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn get_cycles_completed() -> i32 {
    CYCLES_COMPLETED.load(Ordering::SeqCst)
}

// --------------------------
// 4. RESET FUNCTIONS
// --------------------------

#[unsafe(no_mangle)]
pub extern "C" fn reset_energy() {
    ENERGY_USED.store(0, Ordering::SeqCst);
}

#[unsafe(no_mangle)]
pub extern "C" fn reset_cycles() {
    CYCLES_COMPLETED.store(0, Ordering::SeqCst);
}