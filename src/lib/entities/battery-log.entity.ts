import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';


@Entity('battery_logs')
@Index(['droneSerial'])
@Index(['batteryLevel'])
export class BatteryLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'drone_serial' })
    droneSerial!: string;

    @Column('int', { name: 'battery_level' })
    batteryLevel!: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    description?: string;

    @CreateDateColumn({ name: 'created_at' }) // Automatically set on creation
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' }) // Automatically set on update
    updatedAt!: Date;

    constructor(partial: Partial<BatteryLog>) {
        Object.assign(this, partial);
    }
}