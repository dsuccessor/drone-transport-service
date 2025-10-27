import { Router } from 'express';
import { container } from 'tsyringe';
import { DroneController } from '../controllers';
import { droneSchema, getBatteryLogsSchema, getLoadableDroneSchema, loadMedicationSchema, validateQueryParamSchema, validateSchema } from '../schemas';

const router = Router();

export function registerDroneRoutes() {
    const droneController = container.resolve(DroneController);

    // Register a drone
    router.post("/drones", validateSchema(droneSchema), droneController.registerDrone);

    // Load a drone with medications
    router.post("/drones/:serial/load", validateSchema(loadMedicationSchema), droneController.loadDrone);

    // Get loaded medications for a drone
    router.get("/drones/:serial/medications", droneController.droneLoads);

    // Get available drones for loading
    router.get("/drones/available", validateQueryParamSchema(getLoadableDroneSchema), droneController.loadableDrone);

    // Get Drones battery level
    router.get("/drones/:serial/battery", droneController.droneBatteryLevel);

    // Get battery logs
    router.get("/logs/battery", validateSchema(getBatteryLogsSchema), droneController.dronesBatteryLogs);

    return router;
}

