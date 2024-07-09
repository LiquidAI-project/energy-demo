# Energy demo

Repository for the planned energy community demo.

## Running the setup in docker

For convenience there is a `run-demo/docker-compose.yml` and `run-demo/start.sh` scripts. The `start.sh` script will start the WasmIoT orchestrator ([`orchestrator`](http://localhost:3000)), the energy demo UI ([`energy-demo`](http://localhost:5173)) and two wasmiot supervisors ([`equipment1`](http://localhost:3001)) and [`equipment2`](http://localhost:3002)).

To start all or any service, run the following command:
```sh
./run-demo/start.sh [service]
```

To start the necessary services, run the following command:
```sh
./run-demo/start.sh orchestrator frontend equipment1 equipment2
```

## Running UI locally

You can simply run the demo UI locally with following command:
```sh
cd run-demo/frontend
npm start
```
