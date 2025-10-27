import 'reflect-metadata';
import { Repository } from 'typeorm';
import { Drone, DroneMedication, Medication, BatteryLog, DroneStateEnum } from '../src/lib';
import { DroneService } from '../src/services/drone.service';
import { AppError } from '../src/lib/utils';
import { AppDataSource } from '../src/config';



jest.mock('../src/config/typeorm.config', () => ({
    AppDataSource: {
        transaction: jest.fn()
    },
}));

function mockTransactionResponse(response: any) {
    (AppDataSource.transaction as jest.Mock).mockImplementation(async (cb) => {
        cb({
            getRepository: jest.fn().mockReturnValue({
                save: jest.fn().mockResolvedValue(response)
            })
        })
    })
}


describe('DroneService - loadDrone', () => {
    let droneRepo: jest.Mocked<Repository<Drone>>;
    let medicationRepo: jest.Mocked<Repository<Medication>>;
    let droneMedicationRepo: jest.Mocked<Repository<DroneMedication>>;
    let batteryRepo: jest.Mocked<Repository<BatteryLog>>;
    let service: DroneService;

    beforeEach(() => {
        droneRepo = {
            findOne: jest.fn(),
            update: jest.fn(),
        } as any;

        medicationRepo = {
            save: jest.fn(),
        } as any;

        droneMedicationRepo = {
            save: jest.fn(),
        } as any;

        batteryRepo = {} as any;

        service = new DroneService(droneRepo, medicationRepo, droneMedicationRepo, batteryRepo);
    });

    it('should throw if drone not found', async () => {
        droneRepo.findOne.mockResolvedValue(null);
        await expect(service.loadDrone('DRONE-002', [])).rejects.toThrow(AppError);
    });

    it('should throw if drone is non-loadable', async () => {
        const drone = { serial: 'DRONE-002', state: 'DELIVERING', batteryCapacity: 100, medications: [], weightLimit: 500 } as any;
        droneRepo.findOne.mockResolvedValue(drone);

        await expect(service.loadDrone('DRONE-002', [])).rejects.toThrow(/not in a loadable state/);
    });

    it('should throw if battery is below 25%', async () => {
        const drone = { serial: 'DRONE-002', state: DroneStateEnum.IDLE, batteryCapacity: 20, medications: [], weightLimit: 500 } as any;
        droneRepo.findOne.mockResolvedValue(drone);

        await expect(service.loadDrone('DRONE-002', [])).rejects.toThrow(/battery is below 25%/);
    });

    it('should throw if weight exceeds limit', async () => {
        const drone = { serial: 'DRONE-002', state: DroneStateEnum.IDLE, batteryCapacity: 80, medications: [{ medication: { weight: 400 } }], weightLimit: 500 } as any;
        droneRepo.findOne.mockResolvedValue(drone);

        const payload = [{ name: 'Med1', weight: 200, code: 'M1', medicationImage: 'medic.jpg', address: '38, Iyemoja Street, Oshodi', pickupNumber: '09062202857', deliveryNumber: '08141363321' }];

        await expect(service.loadDrone('DRONE-002', payload)).rejects.toThrow(/Load Weight would be exceeded/);
    });

    it('should load medications if all checks pass', async () => {
        const drone = { serial: 'DRONE-002', state: DroneStateEnum.IDLE, batteryCapacity: 80, medications: [], weightLimit: 500 } as any;
        droneRepo.findOne.mockResolvedValue(drone);

        const payload = [{ name: 'Med1', weight: 100, code: 'M1', medicationImage: 'medic.jpg', address: '38, Iyemoja Street, Oshodi', pickupNumber: '09062202857', deliveryNumber: '08141363321' }];
        mockTransactionResponse({ id: 1 });

        await service.loadDrone('DRONE-002', payload);

        expect(AppDataSource.transaction).toHaveBeenCalled();
        expect(droneRepo.findOne).toHaveBeenCalledTimes(2);
    });
});
