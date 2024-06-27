use std::{error::Error, sync::Mutex, time::{Duration, SystemTime}};
use chrono::{prelude::{DateTime, Datelike}, TimeDelta, TimeZone, Utc, Weekday};
use csv::{ReaderBuilder, StringRecord};

const NOT_SET: &str = "*";
const EMPTY_STRING: &str = "";
const COLUMN_SEPARATOR: &str = ";";
const FILE_PATH: &str = "data/data.csv";

const YEAR_COLUMN: &str = "year";
const MONTH_COLUMN: &str = "month";
const DAY_COLUMN: &str = "day";
const HOUR_COLUMN: &str = "hour";
const MINUTE_COLUMN: &str = "minute";
const WEEK_DAY_COLUMN: &str = "day_of_week";
const ENERGY_CONSUMPTION_COLUMN: &str = "energy_usage";
const DURATION_COLUMN: &str = "duration_in_minutes";

static ENERGY_DATA: Mutex<EnergyData> = Mutex::new(EnergyData{loaded: false, data: Vec::new()});


struct EnergyData {
    loaded: bool,
    data: Vec<EnergyUsageData>,
}

struct EnergyUsageData {
    year: Option<i32>,
    month: Option<u32>,
    day: Option<u32>,
    hour: u32,  // the start hour of the event (in UTC)
    minute: u32,  // the start minute of the event (in UTC)
    week_day: Option<chrono::Weekday>,
    energy_consumption: f64,  // the energy consumption during the event in kWh
    duration: u32,  // duration of the event in minutes
}

fn is_leap_year(year: i32) -> bool {
    return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)
}

fn days_in_month(year: i32, month: u32) -> u32 {
    match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 => if is_leap_year(year) { 29 } else { 28 },
        _ => panic!("Invalid month: {}" , month),
    }
}

fn get_next_week_days(week_day: Weekday, count: u32) -> Vec<Weekday> {
    match count {
        0 => vec![week_day],
        n if n >= 7 => (0..7).map(|i| Weekday::try_from(i).unwrap()).collect(),
        n => {
            let day_index = week_day.number_from_monday() as u32;
            (day_index..=day_index+n).map(|i| Weekday::try_from((i % 7) as u8).unwrap()).collect()
        }
    }
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
    let hour: u32 = hour.parse::<u32>()?;
    let minute: u32 = minute.parse::<u32>()?;
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
    let energy_consumption: f64 = energy_consumption.parse::<f64>()?;
    let duration: u32 = duration.parse::<u32>()?;

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

fn get_header_index(headers: &StringRecord, column_name: &str) -> Option<usize> {
    headers.iter().position(|x| x == column_name)
}

fn get_row_value<'a>(row: &'a StringRecord, headers: &'a StringRecord, column_name: &'a str) -> &'a str {
    match get_header_index(headers, column_name) {
        Some(i) => row.get(i).get_or_insert(EMPTY_STRING),
        None => EMPTY_STRING
    }
}

fn read_usage_data() -> Result<Vec<EnergyUsageData>, Box<dyn Error>> {
    let mut csv_reader = ReaderBuilder::new()
        .delimiter(COLUMN_SEPARATOR.as_bytes()[0])
        .from_path(FILE_PATH)?;

    let mut energy_data = Vec::new();
    let headers = csv_reader.headers()?.clone();
    for result in csv_reader.records() {
        let record = result?;
        let data = create_usage_data(
            get_row_value(&record, &headers, YEAR_COLUMN),
            get_row_value(&record, &headers, MONTH_COLUMN),
            get_row_value(&record, &headers, DAY_COLUMN),
            get_row_value(&record, &headers, HOUR_COLUMN),
            get_row_value(&record, &headers, MINUTE_COLUMN),
            get_row_value(&record, &headers, WEEK_DAY_COLUMN),
            get_row_value(&record, &headers, ENERGY_CONSUMPTION_COLUMN),
            get_row_value(&record, &headers, DURATION_COLUMN),
        )?;
        energy_data.push(data);
    }
    Ok(energy_data)
}

fn update_energy_data() -> () {
    let energy_data: Vec<EnergyUsageData> = read_usage_data().unwrap();
    let mut energy_data_lock = ENERGY_DATA.lock().unwrap();
    energy_data_lock.data = energy_data;
    energy_data_lock.loaded = true;
    println!("Energy data updated.");
}

fn overlapping_minutes(start1: &DateTime<Utc>, end1: &DateTime<Utc>, start2: &DateTime<Utc>, end2: &DateTime<Utc>) -> u32 {
    let start = if start1 > start2 { start1 } else { start2 };
    let end = if end1 < end2 { end1 } else { end2 };
    match *end - *start {
        duration if duration <= TimeDelta::zero() => 0,
        duration => duration.num_minutes() as u32,
    }
}

fn calculate_energy(minutes: u32, energy_consumption: f64) -> f64 {
    (minutes as f64 / 60.0) * energy_consumption
}

fn get_energy(start: &DateTime<Utc>, end: &DateTime<Utc>, energy_data: &EnergyUsageData) -> f64 {
    if
        energy_data.year.is_some() &&
        energy_data.month.is_some() &&
        energy_data.day.is_some()
    {
        // the week day is not checked if exact date is given
        let data_start = Utc.with_ymd_and_hms(
            energy_data.year.unwrap(), energy_data.month.unwrap(), energy_data.day.unwrap(),
            energy_data.hour, energy_data.minute, 0
        ).unwrap();
        let data_end = data_start + Duration::from_secs((energy_data.duration * 60) as u64);
        return calculate_energy(
            overlapping_minutes(start, end, &data_start, &data_end),
            energy_data.energy_consumption
        );
    }

    // any energy data entry that would continue to the next day based on the duration is cut off at the end of the day

    let years: Vec<i32> = (start.year()..=end.year())
        .filter(|year| energy_data.year.is_none() || energy_data.year.unwrap() == *year)
        .collect();
    if years.is_empty() {
        return 0.0;
    }

    let months: Vec<u32> = (
            match end.year() - start.year() {
                n if n == 0 => (start.month()..=end.month()).collect::<Vec<_>>(),
                n if n == 1 => (start.month()..=12).chain(1..=end.month()).collect(),
                _ => (1..=12).collect(),
            }
        )
        .iter()
        .map(|month| *month)
        .filter(|month| energy_data.month.is_none() || energy_data.month.unwrap() == *month)
        .collect();
    if months.is_empty() {
        return 0.0;
    }

    let days: Vec<u32> = (
            match months.len() {
                n if n == 1 => (start.day()..=end.day()).collect::<Vec<_>>(),
                n if n == 2 => (start.day()..=days_in_month(start.year(), start.month())).chain(1..=end.day()).collect(),
                _ => (1..=31).collect(),
            }
        )
        .iter()
        .map(|day| *day)
        .filter(|day| energy_data.day.is_none() || energy_data.day.unwrap() == *day)
        .collect();
    if days.is_empty() {
        return 0.0;
    }

    let week_days: Vec<Weekday> = (
            match days.len() {
            n if n == 1 => vec![start.weekday()],
            n if n == 2 => vec![start.weekday(), end.weekday()],
            n if n > 3 && n <= 6 => get_next_week_days(start.weekday(), n as u32),
            _ => vec![Weekday::Mon, Weekday::Tue, Weekday::Wed, Weekday::Thu, Weekday::Fri, Weekday::Sat, Weekday::Sun],
        }
        )
        .iter()
        .map(|week_day| *week_day)
        .filter(|week_day| energy_data.week_day.is_none() || energy_data.week_day.unwrap() == *week_day)
        .collect();
    if week_days.is_empty() {
        return 0.0;
    }

    let datetimes: Vec<DateTime<Utc>> = years
        .iter()
        .flat_map(|year| months
            .iter()
            .flat_map(|month| days
                .iter()
                .flat_map(|day| Utc
                    .with_ymd_and_hms(*year, *month, *day, energy_data.hour, energy_data.minute, 0)
                    .earliest()
                )
            )
        )
        .filter(|datetime| week_days.contains(&datetime.weekday()))
        .collect();

    let mut energy: f64 = 0.0;
    for datetime in datetimes {
        let data_end = datetime + Duration::from_secs((energy_data.duration * 60) as u64);
        energy += calculate_energy(
            overlapping_minutes(start, end, &datetime, &data_end),
            energy_data.energy_consumption
        );
    }

    energy
}

fn get_consumed_energy(start: &DateTime<Utc>, end: &DateTime<Utc>) -> f64 {
    if !ENERGY_DATA.lock().unwrap().loaded {
        update_energy_data();
    }

    if end <= start {
        return 0.0;
    }

    ENERGY_DATA
        .lock()
        .unwrap()
        .data
        .iter()
        .map(|data| get_energy(start, end, data))
        .sum()
}

#[no_mangle]
pub fn consumed_energy(start_time: u64, time_interval: u64) -> f64 {
    let start = DateTime::<Utc>::from(SystemTime::UNIX_EPOCH + Duration::from_secs(start_time));
    let end = start + Duration::from_secs(time_interval);
    get_consumed_energy(&start, &end)
}

fn print_query(start_time: u64, time_interval: u64, result: f64) {
    let start = DateTime::<Utc>::from(SystemTime::UNIX_EPOCH + Duration::from_secs(start_time));
    let end = start + Duration::from_secs(time_interval);
    println!("==========================================================");
    println!("Energy query input parameters: {:?}, {:?}", start_time, time_interval);
    println!("Time interval: {:?} - {:?}", start, end);
    println!("Energy consumed: {}", result);
    println!("==========================================================");
}

fn main() {
    print_query(1719226800, 108000, consumed_energy(1719226800, 108000));
    print_query(1719226800, 5400, consumed_energy(1719226800, 5400));
}
