import { In, MoreThan, Repository } from "typeorm";
import { IDrone, IMedication } from "../interfaces";
import { BatteryLog, Drone, DroneConst, DroneMedication, DroneStateEnum, LoadableStatus, Medication, NonLoadableStatus } from "../lib";
import { inject, injectable } from "tsyringe";
import { AppDataSource } from "../config/typeorm.config";
import { AppError } from "../lib/utils";

@injectable()
export class DroneService {

    constructor(
        @inject("DroneRepository")
        private readonly droneRepo: Repository<Drone>,

        @inject("MedicationRepository")
        private readonly medicationRepo: Repository<Medication>,

        @inject("DroneMedicationRepository")
        private readonly droneMedicationRepo: Repository<DroneMedication>,

        @inject("BatteryRepository")
        private readonly batteryRepo: Repository<BatteryLog>
    ) { }

    // registering a drone
    async createDrone(payload: IDrone): Promise<Drone> {
        const { serial, model, weightLimit, batteryCapacity } = payload;

        // check existing drone
        const existing = await this.droneRepo.findOneBy({ serial });
        if (existing) throw new AppError('drone already exists', 400);

        const drone = this.droneRepo.create({ serial, model, weightLimit, batteryCapacity: batteryCapacity ?? 100, state: DroneStateEnum.IDLE });
        return await this.droneRepo.save(drone);
    }

    // loading a drone with medication items
    async loadDrone(serial: string, payload: IMedication[]): Promise<Drone | null> {

        const drone = await this.droneRepo.findOne({ where: { serial }, relations: ['medications', 'medications.medication'] });
        if (!drone) throw new AppError('drone not found', 400);

        // Prevent the drone from getting use when on non loadable state;
        if (NonLoadableStatus.has(drone.state)) throw new AppError(`Drone is not in a loadable state, currently ${drone.state}`, 400);
        // Prevent the drone from being in LOADING state if the battery level is **below 25%**;
        if (drone.batteryCapacity < 25) throw new AppError('Drone battery is below 25% - cannot load', 400);

        // calculate current load on drone  
        const currentWeight = (drone.medications || []).reduce((s, dm) => s + (dm.medication?.weight || 0), 0);
        if (currentWeight === drone.weightLimit) {
            // Set to loaded
            // If it is charged, currently on loadable status && on max weight
            if (!NonLoadableStatus.has(drone.state)) {
                await this.droneRepo.update({ serial: drone.serial }, { state: DroneStateEnum.LOADED });
            }
            throw new AppError('Drone weight limit already reached');
        }

        const incomingWeight = payload.reduce((s, m) => s + Number(m.weight || 0), 0);

        // Prevent the drone from being loaded with more weight that it can carry
        if ((currentWeight + incomingWeight) > drone.weightLimit) {
            throw new AppError(`Drone Load Weight would be exceeded with this request load! [current load: ${currentWeight}kg | incoming load: ${incomingWeight}kg]`);
        }

        for (const m of payload) {
            // Start Medication & DroneMedication transaction operation
            await AppDataSource.transaction(async (manager) => {
                const droneMedicRepo = manager.getRepository(DroneMedication);
                const medicRepo = manager.getRepository(Medication);

                // create medication rows and link
                const med = await medicRepo.save({ name: m.name, weight: Number(m.weight), code: m.code, medicationImage: m.medicationImage });

                // create delivery order
                await droneMedicRepo.save({ pickupNumber: m.pickupNumber, deliveryNumber: m.deliveryNumber, address: m.address, drone: { serial: drone.serial }, medication: { id: med.id }, status: DroneStateEnum.LOADED });
            })
        }

        return await this.droneRepo.findOne({ where: { serial }, relations: ['medications', 'medications.medication'] });
    }

    // get available drone based on available load space on drones
    async getLoadableDrone(weight: number | null): Promise<Partial<Drone>[]> {
        const condition = {
            state: In([...LoadableStatus]),
            batteryCapacity: MoreThan(DroneConst.MinLoadableBatteryCapacity - 1)
        };

        // extract loadable drones based on loadable state and loadable battery capacity
        let drones = await this.droneRepo.find({
            where: condition,
            relations: ['medications', 'medications.medication']
        });

        // extract loadable drones based on request load (gram)
        if (weight) {
            drones = drones.filter(d => {
                const currentWeight = (d.medications || []).reduce((s, dm) => s + (dm.medication?.weight || 0), 0);
                const estimatedTotalWeight = currentWeight + weight;
                return d.weightLimit >= estimatedTotalWeight;
            })
        }

        return drones.map(d => ({
            serial: d.serial,
            model: d.model,
            weightLimit: d.weightLimit,
            batteryCapacity: d.batteryCapacity,
            state: d.state,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
        }));
    }

    //Get loaded medication items for a given drone
    async getDroneLoads(serial: string): Promise<DroneMedication[]> {

        const drone = await this.droneRepo.findOne({ where: { serial }, relations: ['medications', 'medications.medication'] });
        if (!drone) throw new AppError('drone not found', 400);

        return drone.medications;
    }

    // Get battery level for a given drone
    async getDroneBatteryLevel(serial: string): Promise<Partial<Drone>> {
        const drone = await this.droneRepo.findOneBy({ serial });
        if (!drone) throw new AppError('drone not found', 400);

        return { serial: drone.serial, batteryCapacity: drone.batteryCapacity, state: drone.state, createdAt: drone.createdAt, updatedAt: drone.updatedAt };
    };

    // Get battery logs
    async getBatteryLogs(perPage: number = 20, page: number = 1): Promise<BatteryLog[]> {
        const skip = perPage * (page - 1);
        const logs = await this.batteryRepo.find({ order: { createdAt: 'DESC' }, take: perPage, skip });
        return logs;
    };
}