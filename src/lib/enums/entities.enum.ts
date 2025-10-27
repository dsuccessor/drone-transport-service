export enum DroneStateEnum {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    LOADED = 'LOADED',
    DELIVERING = 'DELIVERING',
    DELIVERED = 'DELIVERED',
    RETURNING = 'RETURNING',
}

export enum DroneModelEnum {
    Lightweight = 'Lightweight',
    Middleweight = 'Middleweight',
    Cruiserweight = 'Cruiserweight',
    Heavyweight = 'Heavyweight',
}

export enum DroneConst {
    MinLoadableBatteryCapacity = 25,
    MaxLoadableWeight = 500,
}

export const NonLoadableStatus = new Set([
    DroneStateEnum.LOADED,
    DroneStateEnum.DELIVERING,
    DroneStateEnum.RETURNING,
    DroneStateEnum.DELIVERED,
]);

export const LoadableStatus = new Set([
    DroneStateEnum.IDLE,
    DroneStateEnum.LOADING,
]);