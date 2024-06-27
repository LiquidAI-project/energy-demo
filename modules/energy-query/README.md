# Energy query module

Running the main function of the module:

```bash
CSV_DATA_PATH=data/data.csv cargo run --release
```

The format for input data CSV files:

- The inspiration for the CSV format is taken from the format [crontab](https://crontab.guru/) uses.
- Each row represents a single event when energy is used.
- Six columns representing the starting point of the event: `year`, `month`, `day`, `hour`, `minute`, `day_of_week`
    - `year` should either be a number for a specific year, or `*` for an event repeating every year.
    - `month` should either be a number for a specific month, or `*` for an event repeating every month of the year.
    - `day` should either be a number for a specific day in a month, or `*` for an event repeating every day for the month.
    - `day_of_week` should either be a string representing a specific day of the week (`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`), or `*`for an event that can happen in any day of the week.
    - `hour` must be a number representing the starting hour of the event in UTC time.
    - `minute` must be a number representing the starting minute of the event in UTC time.
- A column representing the length of the event in minutes: `duration_in_minutes`
- A column representing the average power used during the event in kilowatts: `power_usage`
    - For example, if an event lasts for 2 hours (120 minutes) and the average power is given as 2.5 kW, then the energy consumed during the whole event is 5.0 kWh.

If more than one event matches the same time interval the energy usage from all matching events are summed for the energy query result.

Some examples:

- `2024;6;24;*;15;0;120;1.2`:
    - year: 2024
    - month: 6
    - day: 24
    - day_of_week: *
    - hour: 15
    - minute: 0
    - duration_in_minutes: 120
    - power_usage: 1.2
    - => an event for 1.2 kW used between `2024-06-24T15:00:00Z` and `2024-06-24T17:00:00Z` for a total of 2.4 kWh energy usage
- `*;*;*;Mon;12;0;90;2.5`:
    - year: *
    - month: *
    - day: *
    - day_of_week: Mon
    - hour: 12
    - minute: 0
    - duration_in_minutes: 90
    - power_usage: 2.5
    - => an event that repeats every Monday for 2.5 kW used between `12:00:00Z` and `13:30:00Z` for a total of 3.75 kWh energy usage each time
- `*;*;1;*;6;15;30;10.5`:
    - year: *
    - month: *
    - day: 1
    - day_of_week: *
    - hour: 6
    - minute: 15
    - duration_in_minutes: 30
    - power_usage: 10.5
    - => an event that repeats the first day of each month for 10.5 kW used between `06:15:00Z` and `06:45:00Z` for a total of 5.25 kWh energy usage each time
