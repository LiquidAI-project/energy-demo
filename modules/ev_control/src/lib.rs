// ===========================================
// EV Charger WASM Module (Rust)
// ===========================================


use serde::{Deserialize, Serialize};
// --------------------------
// Internal state variables
// --------------------------

static mut IS_CHARGING: i32 = 0; // 0=stopped,1=charging

#[derive(Debug, Serialize, Deserialize)]
pub struct BatteryStatus {
    pub current_energy: f32,
    pub dischargeable_energy: f32,
}
//static BATTERY_CAPACITY: AtomicI64 = AtomicI64::new(6000);   // 60.00 kWh max
//static CURRENT_ENERGY: AtomicI64 = AtomicI64::new(5000);     // 50.00 kWh starting
//static MIN_ENERGY: AtomicI64 = AtomicI64::new(1000);         // 10.00 kWh minimum
       


//static CARS_TO_DEVICES_ACTIVE: AtomicI32 = AtomicI32::new(0); // 0=disabled,1=enabled
//static CARS_TO_DEVICES_TOTAL: AtomicI64 = AtomicI64::new(0);    // total energy sent to devices

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
        if hour >= 5 && hour < 7 { current_energy = 38.0; } // After morning charge
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
// MAIN FUNCTION FOR EXECUTION
// ===============================
#[no_mangle]
pub extern "C" fn execute_event(code: i32) -> i32 {
    match code {
        1 => {
            start_charging();
            is_charging()
        }
        2 => {
            stop_charging();
            is_charging()
        }
        3 => is_charging(),
        _ => -1,
    }
}

// ===============================
// 2. CARS-TO-DEVICES ENERGY FLOW
// ===============================

/* #[no_mangle]
pub extern "C" fn enable_cars_to_devices() {
    CARS_TO_DEVICES_ACTIVE.store(1, Ordering::SeqCst);
}

#[no_mangle]
pub extern "C" fn disable_cars_to_devices() {
    CARS_TO_DEVICES_ACTIVE.store(0, Ordering::SeqCst);
}

#[no_mangle]
pub extern "C" fn is_cars_to_devices_active() -> i32 {
    CARS_TO_DEVICES_ACTIVE.load(Ordering::SeqCst)
} */

// ===============================
// 3. BATTERY MANAGEMENT
// ===============================

/* #[no_mangle]
pub extern "C" fn charge(amount_hundredths: i64) -> i64 {
    if IS_CHARGING.load(Ordering::SeqCst) == 0 {
        return CURRENT_ENERGY.load(Ordering::SeqCst);
    }

    let mut energy = CURRENT_ENERGY.load(Ordering::SeqCst);
    energy += amount_hundredths;

    let capacity = BATTERY_CAPACITY.load(Ordering::SeqCst);
    if energy > capacity {
        energy = capacity;
    }

    CURRENT_ENERGY.store(energy, Ordering::SeqCst);
    energy
}

#[no_mangle]
pub extern "C" fn discharge(amount_hundredths: i64) -> i64 {
    let mut energy = CURRENT_ENERGY.load(Ordering::SeqCst);
    energy -= amount_hundredths;

    let min_energy = MIN_ENERGY.load(Ordering::SeqCst);
    if energy < min_energy {
        energy = min_energy;
    }

    // Track energy provided to devices if active
    if CARS_TO_DEVICES_ACTIVE.load(Ordering::SeqCst) == 1 {
        let provided = CURRENT_ENERGY.load(Ordering::SeqCst) - energy;
        CARS_TO_DEVICES_TOTAL.fetch_add(provided, Ordering::SeqCst);
    }

    CURRENT_ENERGY.store(energy, Ordering::SeqCst);
    energy
} */

// ===============================
// 4. QUERY FUNCTIONS
// ===============================

/* #[no_mangle]
pub extern "C" fn get_current_energy() -> i64 {
    CURRENT_ENERGY.load(Ordering::SeqCst)
}

#[no_mangle]
pub extern "C" fn get_battery_capacity() -> i64 {
    BATTERY_CAPACITY.load(Ordering::SeqCst)
}

#[no_mangle]
pub extern "C" fn get_min_energy() -> i64 {
    MIN_ENERGY.load(Ordering::SeqCst)
}

#[no_mangle]
pub extern "C" fn get_cars_to_devices_total() -> i64 {
    CARS_TO_DEVICES_TOTAL.load(Ordering::SeqCst)
} */

// ===============================
// 5. UTILITY: MANUALLY SET VALUES
// ===============================

/* #[no_mangle]
pub extern "C" fn set_current_energy(value_hundredths: i64) {
    let capacity = BATTERY_CAPACITY.load(Ordering::SeqCst);
    let min_energy = MIN_ENERGY.load(Ordering::SeqCst);
    let mut val = value_hundredths;
    if val > capacity { val = capacity; }
    if val < min_energy { val = min_energy; }

    CURRENT_ENERGY.store(val, Ordering::SeqCst);
}

#[no_mangle]
pub extern "C" fn set_battery_capacity(value_hundredths: i64) {
    BATTERY_CAPACITY.store(value_hundredths, Ordering::SeqCst);
}

#[no_mangle]
pub extern "C" fn set_min_energy(value_hundredths: i64) {
    MIN_ENERGY.store(value_hundredths, Ordering::SeqCst);
} */
