import { Entity, PrimaryColumn, Column, OneToMany, UpdateDateColumn, CreateDateColumn, Index, BeforeInsert, BeforeUpdate, Repository, DataSource, AfterInsert, AfterUpdate, AfterLoad, getRepository } from 'typeorm';
import { DroneMedication } from './drone-medication.entity';
import { DroneModelEnum, DroneStateEnum } from '../enums';
import { AppDataSource } from '../../config/typeorm.config';

@Entity('drones')
@Index(['model'])
@Index(['batteryCapacity'])
@Index(['state'])
export class Drone {
    @PrimaryColumn({ length: 100 })
    serial!: string;

    @Column({ type: 'enum', enum: DroneModelEnum })
    model!: DroneModelEnum

    @Column({ type: 'int', name: 'weight_limit' })
    weightLimit!: number; // grams, max 500

    @Column({ type: 'int', name: 'battery_capacity' })
    batteryCapacity!: number; // 0-100

    @Column({ type: 'enum', enum: DroneStateEnum, default: DroneStateEnum.IDLE })
    state!: DroneStateEnum;

    @OneToMany(() => DroneMedication, dm => dm.drone, { cascade: true })
    medications!: DroneMedication[];

    @CreateDateColumn({ name: 'created_at' }) // Automatically set on creation
    createdAt?: Date;

    @UpdateDateColumn({ name: 'updated_at' }) // Automatically set on update
    updatedAt?: Date;

    constructor(partial: Partial<Drone>) {
        Object.assign(this, partial);
    }
}