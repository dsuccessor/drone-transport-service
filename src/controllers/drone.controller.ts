import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { DroneService } from "../services";

@injectable()
export class DroneController {
    constructor(
        @inject(DroneService)
        private readonly droneService: DroneService,
    ) { }

    registerDrone = async (req: Request, res: Response, next: NextFunction) => {
        const request = req.body;
        const result = await this.droneService.createDrone(request);
        return res.status(201).json({ success: true, status: 'success', data: result });
    }

    loadDrone = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body;
            const serial = req.params.serial;
            const result = await this.droneService.loadDrone(serial, request);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err) {
            next(err);
        }
    }

    droneLoads = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const serial = req.params.serial;
            const result = await this.droneService.getDroneLoads(serial);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err) {
            next(err);
        }
    }

    loadableDrone = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const weight = req.query.weight ? Number(req.query.weight) : null;
            const result = await this.droneService.getLoadableDrone(weight);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err) {
            next(err);
        }
    }

    droneBatteryLevel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const serial = req.params.serial;
            const result = await this.droneService.getDroneBatteryLevel(serial);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err) {
            next(err);
        }
    }

    dronesBatteryLogs = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.droneService.getBatteryLogs();
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err) {
            next(err);
        }
    }
}