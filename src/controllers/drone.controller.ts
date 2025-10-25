import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { DroneService } from "../services";
import { AppError } from "../lib/utils";

@injectable()
export class DroneController {
    constructor(
        @inject(DroneService)
        private readonly droneService: DroneService,
    ) { }

    async registerDrone(req: Request, res: Response) {
        try {
            const request = req.body;
            const result = await this.droneService.createDrone(request);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err: any) {
            const error = {
                message: err?.message ?? "Something went wrong",
                statusCode: 500
            }

            if (err instanceof AppError) {
                if (err?.statusCode) error.statusCode = err.statusCode;
                console.error(`Error code: ${error.statusCode}, message: ${error.message}`);
            }
            return res.status(error.statusCode).json({ success: false, status: 'failed', error: error.message });
        }
    }

    async loadDrone(req: Request, res: Response) {
        try {
            const request = req.body;
            const serial = req.params.serial;

            const result = await this.droneService.loadDrone(serial, request);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err: any) {
            const error = {
                message: err?.message ?? "Something went wrong",
                statusCode: 500
            }

            if (err instanceof AppError) {
                if (err?.statusCode) error.statusCode = err.statusCode;
                console.error(`Error code: ${error.statusCode}, message: ${error.message}`);
            }
            return res.status(error.statusCode).json({ success: false, status: 'failed', error: error.message });
        }
    }

    async droneLoads(req: Request, res: Response) {
        try {
            const serial = req.params.serial;
            const result = await this.droneService.getDroneLoads(serial);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err: any) {
            const error = {
                message: err?.message ?? "Something went wrong",
                statusCode: 500
            }

            if (err instanceof AppError) {
                if (err?.statusCode) error.statusCode = err.statusCode;
                console.error(`Error code: ${error.statusCode}, message: ${error.message}`);
            }
            return res.status(error.statusCode).json({ success: false, status: 'failed', error: error.message });
        }
    }

    async loadableDrone(req: Request, res: Response) {
        try {
            const kg = req.body;
            const result = await this.droneService.getLoadableDrone(kg);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err: any) {
            const error = {
                message: err?.message ?? "Something went wrong",
                statusCode: 500
            }

            if (err instanceof AppError) {
                if (err?.statusCode) error.statusCode = err.statusCode;
                console.error(`Error code: ${error.statusCode}, message: ${error.message}`);
            }
            return res.status(error.statusCode).json({ success: false, status: 'failed', error: error.message });
        }
    }

    async droneBatteryLevel(req: Request, res: Response) {
        try {
            const serial = req.params.serial;
            const result = await this.droneService.getDroneBatteryLevel(serial);
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err: any) {
            const error = {
                message: err?.message ?? "Something went wrong",
                statusCode: 500
            }

            if (err instanceof AppError) {
                if (err?.statusCode) error.statusCode = err.statusCode;
                console.error(`Error code: ${error.statusCode}, message: ${error.message}`);
            }
            return res.status(error.statusCode).json({ success: false, status: 'failed', error: error.message });
        }
    }

    async dronesBatteryLogs(req: Request, res: Response) {
        try {
            const result = await this.droneService.getBatteryLogs();
            return res.status(201).json({ success: true, status: 'success', data: result });
        } catch (err: any) {
            const error = {
                message: err?.message ?? "Something went wrong",
                statusCode: 500
            }

            if (err instanceof AppError) {
                if (err?.statusCode) error.statusCode = err.statusCode;
                console.error(`Error code: ${error.statusCode}, message: ${error.message}`);
            }
            return res.status(error.statusCode).json({ success: false, status: 'failed', error: error.message });
        }
    }
}