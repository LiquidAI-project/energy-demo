use std::{error::Error, sync::Mutex, time::{Duration, SystemTime}};
use chrono::{prelude::{DateTime, Datelike}, Timelike, Utc, Weekday};
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

#[derive(Debug)]
#[derive(Clone)]
struct EnergyUsageData {
    year: Option<i32>,
    month: Option<u32>,
    day: Option<u32>,
    hour: Option<u32>,
    minute: Option<u32>,
    week_day: Option<chrono::Weekday>,
    energy_consumption: f64,
    duration: u32,
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

fn get_next_week_day(week_day: Weekday, count: u32) -> Weekday {
    match count {
        0 => week_day,
        _ => match week_day {
            Weekday::Mon => get_next_week_day(Weekday::Tue, count - 1),
            Weekday::Tue => get_next_week_day(Weekday::Wed, count - 1),
            Weekday::Wed => get_next_week_day(Weekday::Thu, count - 1),
            Weekday::Thu => get_next_week_day(Weekday::Fri, count - 1),
            Weekday::Fri => get_next_week_day(Weekday::Sat, count - 1),
            Weekday::Sat => get_next_week_day(Weekday::Sun, count - 1),
            Weekday::Sun => get_next_week_day(Weekday::Mon, count - 1),
        }
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
    println!("Energy data updated: {:?}", energy_data_lock.data);
}

fn get_relevant_data(start: &DateTime<Utc>, end: &DateTime<Utc>) -> Vec<EnergyUsageData> {
    // overly complicated way to get all dates between start and end mostly produced by copilot
    // let dates: Vec<(i32, u32, u32)> = (start.year()..=end.year())
    //     .flat_map(|year| {
    //         let start_month = if year == start.year() { start.month() } else { 1 };
    //         let end_month = if year == end.year() { end.month() } else { 12 };
    //         (start_month..=end_month)
    //             .flat_map(|month| {
    //                 let start_day = if year == start.year() && month == start.month() { start.day() } else { 1 };
    //                 let end_day = if year == end.year() && month == end.month() { end.day() } else { days_in_month(year, month) };
    //                 (start_day..=end_day)
    //                     .map(|day| (year, month, day))
    //                     .collect::<Vec<(i32, u32, u32)>>()
    //             })
    //             .collect::<Vec<(i32, u32, u32)>>()
    //     })
    //     .collect();

    let years: Vec<i32> = (start.year()..=end.year()).collect();
    let months: Vec<u32> = match end.year() - start.year() {
        n if n == 0 => (start.month()..=end.month()).collect(),
        n if n == 1 => (start.month()..=12).chain(1..=end.month()).collect(),
        _ => (1..=12).collect(),
    };
    let days: Vec<u32> = match months.len() {
        n if n == 1 => (start.day()..=end.day()).collect(),
        n if n == 2 => (start.day()..=days_in_month(start.year(), start.month())).chain(1..=end.day()).collect(),
        _ => (1..=31).collect(),
    };
    let hours: Vec<u32> = match days.len() {
        n if n == 1 => (start.hour()..=end.hour()).collect(),
        n if n == 2 => (start.hour()..=23).chain(0..=end.hour()).collect(),
        _ => (0..=23).collect(),
    };
    let minutes: Vec<u32> = match hours.len() {
        n if n == 1 => (start.minute()..=end.minute()).collect(),
        n if n == 2 => (start.minute()..=59).chain(0..=end.minute()).collect(),
        _ => (0..=59).collect(),
    };
    let week_days: Vec<Weekday> = match days.len() {
        n if n == 1 => vec![start.weekday()],
        n if n == 2 => vec![start.weekday(), end.weekday()],
        n if n == 3 => get_next_week_days(start.weekday(), n as u32),
        _ => vec![Weekday::Mon, Weekday::Tue, Weekday::Wed, Weekday::Thu, Weekday::Fri, Weekday::Sat, Weekday::Sun],
    };

    ENERGY_DATA
        .lock()
        .unwrap()
        .data
        .iter()
        .filter(|data| {
            let year_check = match data.year {
                Some(year) => years.contains(&year),
                None => true
            };
            let month_check = match data.month {
                Some(month) => months.contains(&month),
                None => true
            };
            let day_check = match data.day {
                Some(day) => days.contains(&day),
                None => true
            };
            let hour_check = match data.hour {
                Some(hour) => hours.contains(&hour),
                None => true
            };
            let minute_check = match data.minute {
                Some(minute) => minutes.contains(&minute),
                None => true
            };
            let week_day_check = match data.week_day {
                Some(week_day) => week_days.contains(&week_day),
                None => true
            };

            // TODO: duration is not checked yet (i.e., should find the data that overlaps with the given time interval)
            // TODO: a simpler way to do this is certainly possible
            year_check && month_check && day_check && hour_check && minute_check && week_day_check
        })
        .map(|data| data.clone())
        .collect()
}

fn get_consumed_energy(start: &DateTime<Utc>, end: &DateTime<Utc>) -> f64 {
    if !ENERGY_DATA.lock().unwrap().loaded {
        update_energy_data();
    }

    if end <= start {
        return 0.0;
    }

    let relevant_data = get_relevant_data(start, end);
    println!("Start date: {:?}", start);
    println!("End date: {:?}", end);
    println!("Relevant data: {:?}", relevant_data);

    1.1
    // let datetime = DateTime::<Utc>::from(SystemTime::UNIX_EPOCH + Duration::from_secs(start_time));
    // let seconds = datetime.second();
    // let week_day = datetime.weekday();
    // println!("Start time: {:?}", datetime);
    // println!("Time interval: {} seconds", time_interval);
    // println!("Week day: {}", week_day);
}

#[no_mangle]
pub fn consumed_energy(start_time: u64, time_interval: u64) -> f64 {
    let start = DateTime::<Utc>::from(SystemTime::UNIX_EPOCH + Duration::from_secs(start_time));
    let end = start + Duration::from_secs(time_interval);
    get_consumed_energy(&start, &end)
}

fn main() {
    println!("Energy consumed: {}", consumed_energy(1719226800, 108000));
}
