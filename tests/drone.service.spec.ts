import 'reflect-metadata';
import { In, MoreThan, Repository } from 'typeorm';
import { Drone, DroneMedication, Medication, BatteryLog, DroneStateEnum, LoadableStatus, DroneConst, DroneModelEnum } from '../src/lib';
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
            findOneBy: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
        } as any;

        medicationRepo = {
            save: jest.fn(),
        } as any;

        droneMedicationRepo = {
            save: jest.fn(),
        } as any;

        batteryRepo = {
            find: jest.fn()
        } as any;

        service = new DroneService(droneRepo, medicationRepo, droneMedicationRepo, batteryRepo);
    });

    describe('createDrone', () => {
        it('should create and save a new drone successfully', async () => {
            const payload = {
                serial: 'DRONE-001',
                model: DroneModelEnum.Lightweight,
                weightLimit: 400,
                batteryCapacity: 90,
            } as any;

            const createdDrone = { ...payload, state: DroneStateEnum.IDLE };

            droneRepo.findOneBy.mockResolvedValue(null); // no existing drone
            droneRepo.create.mockReturnValue(createdDrone);
            droneRepo.save.mockResolvedValue(createdDrone);

            const result = await service.createDrone(payload);

            expect(droneRepo.findOneBy).toHaveBeenCalledWith({ serial: 'DRONE-001' });
            expect(droneRepo.create).toHaveBeenCalledWith({
                serial: 'DRONE-001',
                model: DroneModelEnum.Lightweight,
                weightLimit: 400,
                batteryCapacity: 90,
                state: DroneStateEnum.IDLE,
            });
            expect(droneRepo.save).toHaveBeenCalledWith(createdDrone);
            expect(result).toEqual(createdDrone);
        });

        it('should throw AppError if drone already exists', async () => {
            droneRepo.findOneBy.mockResolvedValue({ serial: 'DRONE-001' } as any);

            await expect(
                service.createDrone({ serial: 'DRONE-001', model: DroneModelEnum.Heavyweight, weightLimit: 300, batteryCapacity: 80 })
            ).rejects.toThrow(AppError);

            await expect(
                service.createDrone({ serial: 'DRONE-001', model: DroneModelEnum.Middleweight, weightLimit: 300, batteryCapacity: 80 })
            ).rejects.toThrow('drone already exists');
        });

        it('should default batteryCapacity to 100 if not provided', async () => {
            const payload = { serial: 'DRONE-002', model: DroneModelEnum.Cruiserweight, weightLimit: 250 } as any;
            const createdDrone = { ...payload, batteryCapacity: 100, state: DroneStateEnum.IDLE };

            droneRepo.findOneBy.mockResolvedValue(null);
            droneRepo.create.mockReturnValue(createdDrone);
            droneRepo.save.mockResolvedValue(createdDrone);

            const result = await service.createDrone(payload);

            expect(droneRepo.create).toHaveBeenCalledWith({
                serial: 'DRONE-002',
                model: DroneModelEnum.Cruiserweight,
                weightLimit: 250,
                batteryCapacity: 100,
                state: DroneStateEnum.IDLE,
            });
            expect(result.batteryCapacity).toBe(100);
        });
    });

    describe('getLoadableDrone', () => {
        it('should return loadable drones with valid battery and state', async () => {
            const mockDrones = [
                {
                    serial: 'DRONE-001',
                    model: DroneModelEnum.Lightweight,
                    weightLimit: 500,
                    batteryCapacity: 80,
                    state: DroneStateEnum.IDLE,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    medications: [],
                },
                {
                    serial: 'DRONE-002',
                    model: DroneModelEnum.Middleweight,
                    weightLimit: 400,
                    batteryCapacity: 20, // do not include low battery
                    state: DroneStateEnum.IDLE,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    medications: [],
                },
            ] as any[];

            droneRepo.find.mockResolvedValue(mockDrones);

            const result = await service.getLoadableDrone(null);

            expect(droneRepo.find).toHaveBeenCalledWith({
                where: {
                    state: In([...LoadableStatus]),
                    batteryCapacity: MoreThan(DroneConst.MinLoadableBatteryCapacity - 1),
                },
                relations: ['medications', 'medications.medication'],
            });

            // Only the drone with sufficient battery should be included
            expect(result).toHaveLength(2); // service filters only if weight is provided
            expect(result[0]).toMatchObject({
                serial: 'DRONE-001',
                model: DroneModelEnum.Lightweight,
            });
        });

        it('should filter out drones exceeding the weight limit', async () => {
            const mockDrones = [
                {
                    serial: 'DRONE-001',
                    model: DroneModelEnum.Lightweight,
                    weightLimit: 500,
                    batteryCapacity: 90,
                    state: DroneStateEnum.IDLE,
                    medications: [
                        { medication: { weight: 100 } },
                        { medication: { weight: 150 } },
                    ],
                },
                {
                    serial: 'DRONE-002',
                    model: DroneModelEnum.Middleweight,
                    weightLimit: 200,
                    batteryCapacity: 90,
                    state: DroneStateEnum.IDLE,
                    medications: [
                        { medication: { weight: 180 } },
                    ],
                },
            ] as any[];

            droneRepo.find.mockResolvedValue(mockDrones);

            const result = await service.getLoadableDrone(200);

            expect(result).toHaveLength(1);
            expect(result[0].serial).toBe('DRONE-001');
        });
    });

    describe('loadDrone', () => {
        it('should throw if drone not found', async () => {
            droneRepo.findOne.mockResolvedValue(null);
            await expect(service.loadDrone('DRONE-002', [])).rejects.toThrow(AppError);
        });

        it('should throw if drone is non-loadable', async () => {
            const drone = { serial: 'DRONE-002', state: DroneStateEnum.DELIVERING, batteryCapacity: 100, medications: [], weightLimit: 500 } as any;
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
    })

    describe('getDroneLoads', () => {
        it('should return medications when the drone exists', async () => {
            const mockDrone = {
                serial: 'DRONE-001',
                medications: [
                    { medication: { name: 'Paracetamol_500', weight: 100 } },
                    { medication: { name: 'Aspirin-250', weight: 150 } },
                ],
            } as any;

            droneRepo.findOne.mockResolvedValue(mockDrone);

            const result = await service.getDroneLoads('DRONE-001');

            expect(droneRepo.findOne).toHaveBeenCalledWith({
                where: { serial: 'DRONE-001' },
                relations: ['medications', 'medications.medication'],
            });

            expect(result).toEqual(mockDrone.medications);
        });

        it('should throw AppError if the drone does not exist', async () => {
            droneRepo.findOne.mockResolvedValue(null);

            await expect(service.getDroneLoads('UNKNOWN'))
                .rejects
                .toThrow(AppError);

            await expect(service.getDroneLoads('UNKNOWN'))
                .rejects
                .toMatchObject({
                    message: 'drone not found',
                    statusCode: 400,
                });
        });
    });

    describe('getDroneBatteryLevel', () => {
        it('should return drone battery details when the drone exists', async () => {
            const mockDrone = {
                serial: 'DRONE-001',
                batteryCapacity: 78,
                state: DroneStateEnum.IDLE,
                createdAt: new Date('2025-01-01T00:00:00Z'),
                updatedAt: new Date('2025-01-02T00:00:00Z'),
            } as any;

            droneRepo.findOneBy.mockResolvedValue(mockDrone);

            const result = await service.getDroneBatteryLevel('DRONE-001');

            expect(droneRepo.findOneBy).toHaveBeenCalledWith({ serial: 'DRONE-001' });

            expect(result).toEqual({
                serial: 'DRONE-001',
                batteryCapacity: 78,
                state: DroneStateEnum.IDLE,
                createdAt: mockDrone.createdAt,
                updatedAt: mockDrone.updatedAt,
            });
        });

        it('should throw AppError if the drone is not found', async () => {
            droneRepo.findOneBy.mockResolvedValue(null);

            await expect(service.getDroneBatteryLevel('UNKNOWN')).rejects.toThrow(AppError);
            await expect(service.getDroneBatteryLevel('UNKNOWN')).rejects.toMatchObject({
                message: 'drone not found',
                statusCode: 400,
            });
        });
    });

    describe('getBatteryLogs', () => {
        it('should return paginated battery logs with correct skip and take', async () => {
            const mockLogs = [
                { id: 1, level: 80, createdAt: new Date('2025-01-02T10:00:00Z') },
                { id: 2, level: 75, createdAt: new Date('2025-01-02T09:00:00Z') },
            ] as any[];

            batteryRepo.find.mockResolvedValue(mockLogs);

            const result = await service.getBatteryLogs(2, 1);

            expect(batteryRepo.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
                take: 2,
                skip: 0,
            });
            expect(result).toEqual(mockLogs);
        });

        it('should correctly calculate skip for later pages', async () => {
            droneRepo.find.mockResolvedValue([]);

            await service.getBatteryLogs(10, 3);

            expect(batteryRepo.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
                take: 10,
                skip: 20,
            });
        });
    })
});
