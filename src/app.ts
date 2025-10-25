
import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/typeorm.config';
import { seed } from './lib/seeders';
import { registerDroneRoutes } from './routes';
import { BatteryLog, Drone } from './lib';
import { registerRepository } from './config';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Define shutdown function
function shutdown(signal?: string) {
    console.log(`Received ${signal ?? 'exit signal'}, shutting down...`);
    process.exit(0);
}

// Attach signals to shutdown
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// handle unhandled errors shutdown
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown();
});


// Start Server
async function start() {

    // Initialize Database
    await AppDataSource.initialize();

    // Register Repositories
    await registerRepository();

    // Automatically create 10 fleet (drones)
    await seed();

    // Create Express Server
    const app = express();

    app.use(bodyParser.json({ limit: '2mb' }));
    app.use(morgan('dev'));

    // Register all drone routes
    const droneRouter = registerDroneRoutes();
    app.use('/api', droneRouter);

    const server = app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

    // Battery checker: runs every 10 minutes and writes battery log entries  
    setInterval(async () => {
        try {
            const droneRepo = AppDataSource.getRepository(Drone);
            const logRepo = AppDataSource.getRepository(BatteryLog);
            const drones = await droneRepo.find();

            for (const d of drones) {
                await logRepo.save({ droneSerial: d.serial, batteryLevel: d.batteryCapacity, description: "N/A" });
            }

            console.log('Battery check logged for', drones.length, 'drones');

        } catch (err) {

            console.error('Battery check failed', err);

        }
    }, 1000 * 60 * 10);

    // exit (close server before shutting down)
    function gracefulExit(signal?: string) {
        console.log(`Received ${signal ?? 'exit'}, closing server...`);
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    }

    process.on('SIGINT', () => gracefulExit('SIGINT'));
    process.on('SIGTERM', () => gracefulExit('SIGTERM'));

}

start().catch(err => {
    console.error('App failed to start', err);
    process.exit(1);
});


