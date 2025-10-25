import { DroneModelEnum, DroneStateEnum } from "../lib";

export interface IDrone {
    serial: string; // 100 characters max
    model: DroneModelEnum;
    weightLimit: number;       // grams, max 500
    batteryCapacity?: number;   // 0–100 percentage
    state?: DroneStateEnum;
}

export interface IMedication {
    /** Medication name — letters, numbers, underscores, and hyphens only */
    name: string;
    /** Weight of the medication in grams */
    weight: number;
    /** Medication code — uppercase letters, underscores, and numbers */
    code: string;
    /** Image URL or path */
    medicationImage: string;
    address: string;
    pickupNumber: string;
    deliveryNumber: string;
}