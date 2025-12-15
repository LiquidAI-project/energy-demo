// ===========================================
// Freezer WASM Module (Rust)
// ===========================================

// --------------------------
// Internal state variables
// --------------------------

static mut IS_POWER_ON: i32 = 0; // 0=off, 1=on
static INTERNAL_TEMP: i32 = -17;
static EXTERNAL_TEMP: i32 = 12;
static mut ENERGY_CONSUMPTION: i32 = 0;

// ===============================
// 1. ON/OFF FUNCTIONS
// ===============================
#[unsafe(no_mangle)]
pub extern "C" fn turn_on() {
    unsafe { IS_POWER_ON = 1; }
}

#[unsafe(no_mangle)]
pub extern "C" fn turn_off() {
    unsafe { IS_POWER_ON = 0; }
}

#[unsafe(no_mangle)]
pub extern "C" fn is_power_on() -> i32 {
    unsafe { IS_POWER_ON }
}

// ===============================
// 2. BASIC TEMPERATURE FUNCTIONS
// ===============================
#[unsafe(no_mangle)]
pub extern "C" fn get_internal_temp() -> i32 {
    INTERNAL_TEMP
}

#[unsafe(no_mangle)]
pub extern "C" fn get_external_temp() -> i32 {
    EXTERNAL_TEMP
}

// ===============================
// 3. ENERGY CONSUMPTION FUNCTIONS
// ===============================

#[unsafe(no_mangle)]
pub extern "C" fn set_energy_consumption(energy_consumption: i32) -> i32 {
    unsafe { ENERGY_CONSUMPTION += energy_consumption; }
    get_consumed_energy()
}

#[unsafe(no_mangle)]
pub extern "C" fn get_consumed_energy() -> i32 {
    unsafe { ENERGY_CONSUMPTION }
}

// ===============================
// MAIN FUNCTION FOR EXECUTION
// ===============================
#[unsafe(no_mangle)]
pub extern "C" fn execute_event(event_id: i32, energy_consumption: i32) -> i32 {
    match event_id {
        1 => {
            turn_on();
            is_power_on()
        }
        2 => {
            turn_off();
            is_power_on()
        }
        3 => is_power_on(),
        4 => get_internal_temp(),
        5 => get_external_temp(),
        6 => get_consumed_energy(),
        7 => set_energy_consumption(energy_consumption),
        _ => -1,
    }
}