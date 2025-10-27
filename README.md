# drone-transport-service

A basic Air-Borne (Drone) delivery service

This repository implements a small REST API (Node.js + TypeScript + Express + TypeORM + Postgresql) that satisfies the exercise requirements.

# notes / assumptions

Database: Postgresql using TypeORM with synchronize: true so the project runs locally without extra DB setup.

Drones: maximum 10 preloaded drones on startup (see seed() in src/lib/seeders/seed.ts).

Medication images: stored as base64 string in DB (simple approach for this exercise). In a real system we use object storage (multer).

Weight units: grams.

Battery check task: runs every 10 minute (configurable) and writes a BatteryLog audit entry for each drone.

Loading logic: a drone cannot enter LOADING if battery < 25%. A drone cannot be loaded beyond its weight limit.

a drone can only be load in a loadable state (when it is idle or available)

Data format: all input/output in JSON.

# How to run

# Auto Runner (Containerized - Database & App)

This auto run enable to start database & app with just one command.

1. Ensure you set the following env keys [DB_TYPE, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, NODE_ENV].
2. Download & Install Docker
3. Run `docker compose up -d` on the terminal
4. Ready to go, Proceed to calling the endpoints.

# Semi Auto Runner (Containerized DB only)

Run and start docker

==> Setting up database

download docker locally

set the following inside your .env [DB_TYPE, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME]

run `docker compose up -d` to start up database server

# Starting up local server

Requirements: Node.js >= 20, pnpm

# install

`pnpm install`

# build (typescript)

`pnpm run build`

# run

`pnpm run start`

# For development directly (build & start)

`pnpm run dev`

The app will create all tables (drone, medication, droneMedication, batteryLog) and seed 10 drones automatically into drone table.

# Run test file (jest)

`pnpm run test`

# API Endpoints (summary)

=> All endpoints accept and return JSON.

# Register/Create Drone

=> `POST /api/drones` — Register a drone (body: drone object)

=> Payload Sample <=

=> Payload type <=

`Body:`

`{`
`"serial": "DRONE-002",`
`"model": "Heavyweight",`
`"weight_limit": 260,`
`"battery_capacity": 40`
`}`

# Load Drone

=> `POST /api/drones/:serial/load` — Load a drone with medications (body: medication array)

=> Payload Sample <=

=> Payload type <=

`Body:`

`[{`
`"name": "Paracetamol_500",`
`"weight": 50,`
`"code": "PARA_500",`
`"pickupNumber": "+2347012345678",`
`"deliveryNumber": "+2348098765432",`
`"address": "12, Victoria Island, Lagos, Nigeria",`
`"medicationImage": "https://example.com/images/paracetamol_500.png"`
`},`
`{`
`"name": "Amoxicillin-250",`
`"weight": 30,`
`"code": "AMOX_250",`
`"pickupNumber": "08012345678",`
`"deliveryNumber": "08198765432",`
`"address": "45, Ikeja GRA, Lagos, Nigeria",`
`"medicationImage": "https://example.com/images/amoxicillin_250.png"`
`}]`

# Get Drone-Load

=> `GET /api/drones/:serial/medications` — Get loaded medication items for a drone

=> Response Sample <=

`{`
`"success": true,`
`"status": "success",`
`"data": [{`
`"id": "96d3b3fe-d997-4df4-8e72-8169c79bcad6",`
`"pickupNumber": "+2347012345678",`
`"deliveryNumber": "+2348098765432",`
`"address": "12, Victoria Island, Lagos, Nigeria",`
`"status": "LOADED",`
`"createdAt": "2025-10-25T09:30:35.029Z",`
`"updatedAt": "2025-10-25T09:30:35.029Z",`
`"medication": {`
`"id": "e9e2a330-9572-4915-9ef2-a7cef51c8fb0",`
`"name": "Paracetamol_500",`
`"weight": 50,`
`"code": "PARA_500",`
`"medicationImage": "https://example.com/images/paracetamol_500.png",`
`"createdAt": "2025-10-25T09:30:35.029Z",`
`"updatedAt": "2025-10-25T09:30:35.029Z"`
`}`
`}]`
`}`

# Get Available (Loadable) Drone

=> `GET /api/drones/available` — Get drones available for loading

=> Payload type <=

Query Param

- `weight: number;`
- optional

=> Response Sample <=

`{`
`"success": true,`
`"status": "success",`
`"data": [{`
`"serial": "DRONE-009",`
`"model": "Cruiserweight",`
`"weightLimit": 420,`
`"batteryCapacity": 75,`
`"state": "IDLE",`
`"createdAt": "2025-10-25T08:18:40.732Z",`
`"updatedAt": "2025-10-25T08:18:40.732Z"`
`}]`
`}`

# Get Drone Battery Level

=> `GET /api/drones/:serial/battery` — Get battery level for a drone

=> Response Sample <=

`{`
`"success": true,`
`"status": "success",`
`"data": {`
`"serial": "DRONE-002",`
`"batteryCapacity": 40,`
`"state": "IDLE",`
`"createdAt": "2025-10-25T08:18:40.732Z",`
`"updatedAt": "2025-10-25T08:18:40.732Z"`
`}`
`}`

# Get Drone battery logs

=> `GET /api/logs/battery` — Get battery audit logs (paginated)

=> Sample Payload <=

=> Payload type <=

`Body:`

required: Optional

`{`
`"perPage": 5,`
`"page": 2`
`}`

=> Response Sample <=

`{`
`"success": true,`
`"status": "success",`
`"data": [{`
`"id": "572f71bf-37ab-4920-aeee-6022f260aed5",`
`"droneSerial": "DRONE-004",`
`"batteryLevel": 22,`
`"description": "N/A",`
`"createdAt": "2025-10-25T08:56:55.126Z",`
`"updatedAt": "2025-10-25T08:56:55.126Z"`
`},`
`{`
`"id": "ffea203d-edcd-41ae-9bfb-ffd2e799b4f4",`
`"droneSerial": "DRONE-007",`
`"batteryLevel": 10,`
`"description": "N/A",`
`"createdAt": "2025-10-25T08:56:55.124Z",`
`"updatedAt": "2025-10-25T08:56:55.124Z"`
`}]`
`}`
