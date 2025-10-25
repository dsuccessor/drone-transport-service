import { Router } from 'express';
import { container } from 'tsyringe';
import { DroneController } from '../controllers';

const router = Router();

export function registerDroneRoutes() {
    const droneController = container.resolve(DroneController);

    // Register a drone
    router.post("/drones", (req, res) => droneController.registerDrone(req, res));

    // Load a drone with medications
    router.post("/drones/:serial/load", (req, res) => droneController.registerDrone(req, res));

    // Get loaded medications for a drone
    router.get("/drones/:serial/medications", (req, res) => droneController.registerDrone(req, res));

    // Get available drones for loading
    router.get("/drones/available", (req, res) => droneController.registerDrone(req, res));

    // Get Drones battery level
    router.get("/drones/:serial/battery", (req, res) => droneController.registerDrone(req, res));

    // Get battery logs
    router.get("/logs/battery", (req, res) => droneController.registerDrone(req, res));

    return router;
}

