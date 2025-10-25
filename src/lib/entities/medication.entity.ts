import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { DroneMedication } from './drone-medication.entity';
import { DroneStateEnum } from '../enums';


@Entity('medications')
@Index(['name'])
@Index(['code'])
export class Medication {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('varchar')
    name!: string; // letters numbers - _ only

    @Column('int')
    weight!: number; // grams

    @OneToMany(() => DroneMedication, (dm) => dm.medication)
    droneMedications!: DroneMedication[];

    @Column('varchar')
    code!: string; // UPPERCASE letters, underscore, numbers

    @Column('text', { nullable: true, name: 'medication_image' })
    medicationImage?: string | null;

    @CreateDateColumn({ name: 'created_at' }) // Automatically set on creation
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' }) // Automatically set on update
    updatedAt!: Date;

    constructor(partial: Partial<Medication>) {
        Object.assign(this, partial);
    }
}