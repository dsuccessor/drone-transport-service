import { AppDataSource } from "../../config/typeorm.config";
import { Drone } from "../entities";
import { DroneModelEnum, DroneStateEnum } from "../enums";
import { getRandomEnumValue } from "../utils/util";

export async function seed() {
    const droneRepo = AppDataSource.getRepository(Drone);
    const count = await droneRepo.count();
    if (count >= 10) return;

    const drones: Partial<Drone>[] = [];
    for (let i = 1;
        i <= (10 - count);
        i++) {

        const weight = 100 + (i % 5) * 80;
        const battery = 30 + (i * 5) % 70;

        const drone = {
            serial: `DRONE-${i.toString().padStart(3, '0')}`,
            model: getRandomEnumValue(DroneModelEnum),
            weightLimit: Math.min(weight, 500),
            batteryCapacity: Math.min(battery, 100),
            state: DroneStateEnum.IDLE,
        }

        drones.push(drone);

    }

    await droneRepo.save(drones);
    console.log('Seeded drones');
} 