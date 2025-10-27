import { AppDataSource } from "../config";
import { BatteryLog, Drone } from "../lib";

export function droneBatteryLog(interval: number) {
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
    }, interval);
};