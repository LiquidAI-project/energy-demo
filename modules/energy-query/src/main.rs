use std::{error::Error, time::{Duration, SystemTime}};
use chrono::{prelude::{DateTime, Datelike}, Timelike, Utc, Weekday};
use csv::ReaderBuilder;

const NOT_SET: &str = "*";
const EMPTY_STRING: &str = "";
const COLUMN_SEPARATOR: &str = ";";
const FILE_PATH: &str = "data/data.csv";


#[derive(Debug)]
struct EnergyUsageData {
    year: Option<i32>,
    month: Option<u32>,
    day: Option<u32>,
    hour: Option<u32>,
    minute: Option<u32>,
    week_day: Option<chrono::Weekday>,
    energy_consumption: f64,
    duration: Option<u32>,
}

fn get_parsed_value<T>(value: &str) -> Result<Option<T>, Box<dyn Error>> where T: std::str::FromStr {
    match value.parse::<T>() {
        Ok(parsed_value) => Ok(Some(parsed_value)),
        Err(_) => match value {
            NOT_SET | EMPTY_STRING => Ok(None),
            _ => return Err(format!("Invalid value: {}", value).into())
        }
    }
}

fn create_usage_data(
    year: &str, month: &str, day: &str, hour: &str, minute: &str,
    week_day: &str, energy_consumption: &str, duration: &str
) -> Result<EnergyUsageData, Box<dyn Error>>{
    let year: Option<i32> = get_parsed_value(year)?;
    let month: Option<u32> = get_parsed_value(month)?;
    let day: Option<u32> = get_parsed_value(day)?;
    let hour: Option<u32> = get_parsed_value(hour)?;
    let minute: Option<u32> = get_parsed_value(minute)?;
    let week_day = match week_day.to_lowercase().as_str() {
        "mon" | "1" => Some(Weekday::Mon),
        "tue" | "2" => Some(Weekday::Tue),
        "wed" | "3" => Some(Weekday::Wed),
        "thu" | "4" => Some(Weekday::Thu),
        "fri" | "5" => Some(Weekday::Fri),
        "sat" | "6" => Some(Weekday::Sat),
        "sun" | "7" => Some(Weekday::Sun),
        NOT_SET | EMPTY_STRING => None,
        _ => return Err(format!("Invalid week day: {}", week_day).into())
    };
    let energy_consumption = energy_consumption.parse::<f64>()?;
    let duration: Option<u32> = get_parsed_value(duration)?;
    Ok(EnergyUsageData {
        year,
        month,
        day,
        hour,
        minute,
        week_day,
        energy_consumption,
        duration,
    })
}

fn read_usage_data() -> Result<Vec<EnergyUsageData>, Box<dyn Error>> {
    let mut csv_reader = ReaderBuilder::new()
        .delimiter(COLUMN_SEPARATOR.as_bytes()[0])
        .from_path(FILE_PATH)?;

    let mut energy_data = Vec::new();
    for result in csv_reader.records() {
        let record = result?;
        let data = create_usage_data(
            &record[0], &record[1], &record[2],
            &record[3], &record[4], &record[5],
            &record[6], &record[7]
        )?;
        energy_data.push(data);
    }
    Ok(energy_data)
}

#[no_mangle]
pub fn consumed_energy(start_time: u64, time_interval: u64) -> f64 {
    let datetime = DateTime::<Utc>::from(SystemTime::UNIX_EPOCH + Duration::from_secs(start_time));
    let seconds = datetime.second();
    let week_day = datetime.weekday();
    println!("Start time: {:?}", datetime);
    println!("Time interval: {} seconds", time_interval);
    println!("Week day: {}", week_day);
    // some dummy computation for testing
    (week_day.num_days_from_monday() + seconds) as f64 * time_interval as f64 * 0.123 as f64
}

fn main() {
    let test_value = read_usage_data().unwrap();
    println!("{:?}", test_value);
    println!("Energy consumed: {}", consumed_energy(1519813419, 3600));
}
