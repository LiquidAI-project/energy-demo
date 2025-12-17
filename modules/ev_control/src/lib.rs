// ===========================================
// EV Charger WASM Module (Rust)
// ===========================================


use serde::{Deserialize, Serialize};

// --------------------------
// Internal state variables
// --------------------------

static mut IS_CHARGING: i32 = 0; // 0=stopped,1=charging
#[repr(C)]
#[derive(Debug, Serialize, Deserialize)]
pub struct BatteryStatus {
    pub current_energy: f32,
    pub dischargeable_energy: f32,
}

// ===============================
// 1. START/STOP CHARGING
// ===============================
#[no_mangle]
pub extern "C" fn start_charging() {
    unsafe { IS_CHARGING = 1; }
}

#[no_mangle]
pub extern "C" fn stop_charging() {
    unsafe { IS_CHARGING = 0; }
}

#[no_mangle]
pub extern "C" fn is_charging() -> i32 {
    unsafe { IS_CHARGING }
}

// ===============================
// 2. BATTERY STATUS
// ===============================
#[no_mangle]
pub extern "C" fn get_battery_status(hour: u32, minute: u32, car_id: u32) -> BatteryStatus {
    let current_time = hour as f32 + (minute as f32 / 60.0);
    let mut current_energy = 10.0; // Default base value

    // Logic ported from DemoControlls.jsx
    if hour >= 1 && hour < 5 {
        // Charging phase (Both cars)
        let start_hour = 1.0;
        let starting_charge = 10.0;
        let charging_rate = 7.0;
        let hours_elapsed = current_time - start_hour;
        current_energy = (starting_charge + hours_elapsed * charging_rate).min(60.0);
    } else if car_id == 2 && hour >= 7 && hour < 9 {
        // Car 2 Discharging (Providing energy to Freezer)
        let start_hour = 7.0;
        let starting_charge = 36.0;
        let discharge_rate = 1.5;
        let hours_elapsed = current_time - start_hour;
        current_energy = (starting_charge - hours_elapsed * discharge_rate).max(0.0);
    } else if car_id == 1 && hour >= 8 && hour < 9 {
        // Car 1 Discharging (Providing energy to Washing Machine)
        let start_hour = 8.0;
        let starting_charge = 36.0;
        let discharge_rate = 1.5;
        let hours_elapsed = current_time - start_hour;
        current_energy = (starting_charge - hours_elapsed * discharge_rate).max(0.0);
    } else if hour >= 10 && hour < 18 {
        // Driving/Away phase
        let start_hour = 10.0;
        let discharge_rate = 2.5;
        let hours_elapsed = current_time - start_hour;
        
        let start_energy = if car_id == 1 { 34.7 } else { 33.2 };
        current_energy = (start_energy - hours_elapsed * discharge_rate).max(0.0);
    } else if hour >= 21 && hour < 23 {
        // Late night charging
        let start_hour = 21.0;
        let charging_rate = 7.0;
        let hours_elapsed = current_time - start_hour;
        
        let start_energy = if car_id == 1 { 15.1 } else { 13.6 };
        current_energy = (start_energy + hours_elapsed * charging_rate).min(60.0);
    } else {
        // Default static values for gaps to match demo state continuity
        if hour >= 5 && hour < 7 { current_energy = 36.0; } // After morning charge
        else if hour >= 9 && hour < 10 { current_energy = 34.5; } // After discharging
        else if hour >= 18 && hour < 21 { 
             // After driving, before night charge
             current_energy = if car_id == 1 { 15.1 } else { 13.6 }; 
        }
    }

    // Round to 1 decimal place for consistency
    current_energy = (current_energy * 10.0).floor() / 10.0;

    // Calculate dischargeable energy (Reserve 20kWh)
    let min_required = 20.0;
    let dischargeable_energy = (current_energy - min_required).max(0.0);

    BatteryStatus {
        current_energy,
        dischargeable_energy,
    }
}

// ===============================
// DEBUG HELPER (For CLI)
// ===============================
#[no_mangle]
pub extern "C" fn get_current_energy(hour: u32, minute: u32, car_id: u32) -> f32 {
    let status = get_battery_status(hour, minute, car_id);
    status.current_energy
}

#[no_mangle]
pub extern "C" fn get_dischargeable_energy(hour: u32, minute: u32, car_id: u32) -> f32 {
    let status = get_battery_status(hour, minute, car_id);
    status.dischargeable_energy
}

// ===============================
// MAIN FUNCTION FOR EXECUTION
// ===============================
#[no_mangle]
pub extern "C" fn execute_event(event_id: i32, hour: u32, minute: u32, car_id: u32) -> f32 {
    match event_id {
        1 => {
            start_charging();
            is_charging() as f32
        }
        2 => {
            stop_charging();
            is_charging() as f32
        }
        3 => is_charging() as f32,
        4 => {
            get_current_energy(hour, minute, car_id)
        }
        _ => -1.0,
    }
}
