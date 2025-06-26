# Energy demo

Repository for the planned energy community demo.

## Running the setup in docker

For convenience there is a `run-demo/docker-compose.yml` and `run-demo/start.sh` scripts. The `start.sh` script will start the WasmIoT orchestrator ([`orchestrator`](http://localhost:3000)) and the energy demo UI ([`energy-demo`](http://localhost:5173)).

To start all or any service, run the following command:

```sh
./run-demo/start.sh
```

## Stopping Docker services

To stop and remove all or any service, run the following command:

```bash
./run-demo/stop.sh
```

## Running UI locally

You can simply run the demo UI locally with following command:

```sh
cd run-demo/frontend
npm start
