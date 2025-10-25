import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Column, Index } from 'typeorm';
import { Medication } from './medication.entity';
import { Drone } from './drone.entity';
import { DroneStateEnum } from '../enums';


@Entity('drone_medications')
@Index(['status'])
@Index(['pickupNumber'])
@Index(['deliveryNumber'])
export class DroneMedication {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 14, name: 'pickup_number' })
    pickupNumber!: string;

    @Column({ type: 'varchar', length: 14, name: 'delivery_number' })
    deliveryNumber!: string;

    @Column('text')
    address!: string;

    @Column({ type: 'enum', enum: DroneStateEnum, default: DroneStateEnum.IDLE })
    status!: DroneStateEnum;

    @ManyToOne(() => Drone, d => d.medications)
    drone?: Drone;

    @ManyToOne(() => Medication, { cascade: true })
    medication?: Medication;

    @CreateDateColumn({ name: 'created_at' }) // Automatically set on creation
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' }) // Automatically set on update
    updatedAt!: Date;

    constructor(partial: Partial<DroneMedication>) {
        Object.assign(this, partial);
    }
}