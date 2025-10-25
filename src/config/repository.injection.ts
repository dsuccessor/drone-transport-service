import { container } from "tsyringe";
import { AppDataSource } from "./typeorm.config";
import { BatteryLog, Drone, DroneMedication, Medication } from "../lib";


export async function registerRepository() {
    // Register repositories
    container.register("DroneRepository", {
        useValue: AppDataSource.getRepository(Drone),
    });

    container.register("MedicationRepository", {
        useValue: AppDataSource.getRepository(Medication),
    });

    container.register("DroneMedicationRepository", {
        useValue: AppDataSource.getRepository(DroneMedication),
    });

    container.register("BatteryRepository", {
        useValue: AppDataSource.getRepository(BatteryLog),
    });
}
