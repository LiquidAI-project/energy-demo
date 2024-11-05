use std::{error::Error, fs::OpenOptions, io::Write, thread, time::Duration};
use chrono::{Utc, Timelike, Datelike, Weekday, TimeZone};

// Constants
const CSV_FILE_PATH: &str = "data"; // File path to be used for writing energy usage data
const SIMULATION_RATIO: u64 = 10; // Number of seconds in simulation for every hour of real-world operation.

// Structure to hold energy usage data
#[derive(Debug)]
struct EnergyUsageData {
    year: i32,
    month: u32,
    day: u32,
    day_of_week: Option<Weekday>,
    hour: u32,
    minute: u32,
    duration_in_minutes: u32,
    power_usage: f64,
}

// Function to simulate energy usage based on duration
fn simulate_energy_usage(duration: Duration) -> f64 {
    // Calculate the real-world duration from the simulated duration
    let real_world_duration_in_hours = (duration.as_secs() as f64) * 1.0 / (SIMULATION_RATIO as f64);
    // Assume energy consumption is 1.2 kWh per hour of operation
    1.2 * real_world_duration_in_hours
}

// Function to write energy usage data to CSV
fn write_energy_usage_to_csv(data: &EnergyUsageData) -> Result<(), Box<dyn Error>> {
    let output_line = format!(
        "{};{};{};{};{};{};{};{:.1}",
        data.year,
        data.month,
        data.day,
        data.day_of_week.map_or("*".to_string(), |wd| wd.to_string()),
        data.hour,
        data.minute,
        data.duration_in_minutes,
        data.power_usage
    );

    let mut file = OpenOptions::new()
        .write(true)
        .append(true)
        .create(true)
        .open(CSV_FILE_PATH)?;

    file.write_all(format!("{}\n", output_line).as_bytes())?;
    file.flush()?;
    Ok(())
}

fn run_washing_machine_internal(start_time_unix: i64, duration_in_secs: u64) -> Result<f64, Box<dyn Error>> {
    // Convert Unix time to a DateTime<Utc>
    let start_time = Utc.timestamp_opt(start_time_unix, 0).single().ok_or("Invalid timestamp")?;
    println!("Starting washing machine simulation at: {:?}", start_time);

    // Calculate the actual simulation duration based on the SIMULATION_RATIO
    let simulated_duration = Duration::from_secs(duration_in_secs * SIMULATION_RATIO / 3600);
    println!("Simulating for {} seconds (actual duration: {} seconds)", duration_in_secs, simulated_duration.as_secs());

    // Simulate the duration of the washing machine operation
    thread::sleep(simulated_duration);

    // Calculate the end time of the simulation by adding the simulated duration to the start time
    let end_time = start_time + chrono::Duration::seconds(duration_in_secs as i64);
    println!("Finished washing machine simulation at: {:?}", end_time);

    // Calculate energy usage based on the simulated duration
    let energy_usage = simulate_energy_usage(simulated_duration);
    let usage_data = EnergyUsageData {
        year: end_time.year(),
        month: end_time.month(),
        day: end_time.day(),
        day_of_week: Some(end_time.weekday()),
        hour: start_time.hour(),
        minute: start_time.minute(),
        duration_in_minutes: (duration_in_secs / 60) as u32, // Convert seconds to minutes for logging
        power_usage: energy_usage,
    };

    // Write to CSV
    write_energy_usage_to_csv(&usage_data)?;
    println!("Energy usage recorded: {:?}", usage_data);

    // Return the consumed energy
    Ok(energy_usage)
}

#[no_mangle]
pub fn run_washing_machine(start_time_unix: i64, duration_in_secs: u64) -> f64 {
    match run_washing_machine_internal(start_time_unix, duration_in_secs) {
        Ok(result) => result,
        Err(error) => {
            println!("Error: {:?}", error);
            0.0
        }
    }
}

fn main() {
    let start_time_unix = 1719328500;
    let duration_in_secs = 3600;
    let energy_used = run_washing_machine(start_time_unix, duration_in_secs);
    println!("Energy used: {} kWh", energy_used);
}
