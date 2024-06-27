# WASM modules for the energy demo

Contains the WASM modules that are deployed by the [orchestrator](https://github.com/LiquidAI-project/wasmiot-orchestrator) to the [supervisors](https://github.com/LiquidAI-project/wasmiot-supervisor) representing the devices in the energy community demo.

Contents:

- [Energy query](./energy-query/) module

## Compiling the modules

Install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Install the required targets:

```bash
rustup target add wasm32-wasi
```

Compile the modules

```bash
cd energy-query
cargo build --target wasm32-wasi --release
# the compiled wasm file will be at target/wasm32-wasi/release/energy-query.wasm
```

## Deploying the modules with the orchestrator

Energy query module:

- Create a new module `Module creation`
    - Name: `energy-query` (or something else)
    - WebAssembly binary: the compiled `energy-query.wasm` file
- Create description for the module with `Module description`
    - In `consumed_energy` function add a mount named `data`
    - The `data` mound needs to be of type `Deployment`
    - The associated file should be the CSV file containing the energy usage data
        - The orchestrator does not accept CSV files (a bug?), so the file must be renamed, for example, to `data.wasm_csv`
        - Example data file is at [energy-query/data/data.csv](energy-query/data/data.csv)
        - More information on the data file syntax at the energy query module [readme](energy-query/README.md)
        - At the moment, if a different energy data is required, a separate module with the new data must be created.
- Create a deployment manifest for the module with `Deployment manifest creation`
    - Choose only a single step with the `energy-query:consumed_energy` function
- Deploy the module to a supervisor with `Deployment of deployment manifests`
- (Optional) Test the deployment with `Execution`
    - The function takes two parameters that represent the queries time interval:
        - The first parameter is the start point of the time interval given in UNIX timestamp in seconds
            - For example, `1719226800`, would represent `2024-06-24T11:00:00Z` in UTC time.
        - The second parameter represents the length of the queried time interval in seconds:
            - For example, `5400`, would represent 5 400 seconds or 1.5 hours.
    - The output from the function represents the consumed energy within the given time interval in kilowatt-hours.
        - For example, using the default data CSV, query with parameters `1719226800` and `5400` should give the result `1.25` (kWh).
    - The data CSV is read by the module when the first query is made, and thus getting the result for that might take a little longer than any later queries.
    - At the moment, the module handles the time in whole minutes.
    - In case of an error, the return value will be 0.0, as in no energy consumed.
        - The supervisor output (not the logs sent to the orchestrator) might show the reason for the error.
        - The same zero output will also happen if there are no events in the CSV data matching the query interval.
