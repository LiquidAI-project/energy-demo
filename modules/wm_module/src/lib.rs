// ===========================================
// Washing Machine WASM Module (Rust)
// ===========================================


// --------------------------
// Internal state variables
// --------------------------

static mut IS_WASHING: i32 = 0; // 0=off, 1=on
static mut ENERGY_CONSUMPTION: i32 = 0;

// ===============================
// 1. ON/OFF FUNCTIONS
// ===============================
#[unsafe(no_mangle)]
pub extern "C" fn start_washing() {
    unsafe { IS_WASHING = 1; }
}

#[unsafe(no_mangle)]
pub extern "C" fn stop_washing() {
    unsafe { IS_WASHING = 0; }
}

#[unsafe(no_mangle)]
pub extern "C" fn is_washing() -> i32 {
    unsafe { IS_WASHING }
}

// ===============================
// 2. ENERGY CONSUMPTION FUNCTIONS
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
            start_washing();
            is_washing()
        }
        2 => {
            stop_washing();
            is_washing()
        }
        3 => is_washing(),
        4 => get_consumed_energy(),
        5 => set_energy_consumption(energy_consumption),
        _ => -1,
    }
}