# Washing machine run module

Running the main function of the module:

```bash
cargo run
```

The purpose of this module is to simulate the run of the washing machine. This will simulate the run of the washing machine for one hour but actual time taken will be 10 seconds (According to the given code). If you need to change the simulation time, please change the below value in the code,

```bash
const SIMULATION_RATIO: u64 = 10; //Change this 
```

After the simulated time, it will genrate the data file with the energy usage as below,


Some examples:

- `2024;6;24;Mon;15;0;60;1.2`:
    - year: 2024
    - month: 6
    - day: 24
    - day_of_week: Monday
    - hour: 15
    - minute: 0
    - duration_in_minutes: 120
    - power_usage: 1.2
    - => an event for 1.2 kW used between `2024-06-24T15:00:00Z` and `2024-06-24T16:00:00Z` for a total of 1.2 kWh energy usage