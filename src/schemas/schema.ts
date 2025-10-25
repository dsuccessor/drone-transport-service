import Joi from 'joi';
import { DroneModelEnum, DroneStateEnum } from '../lib';

export const droneSchema = Joi.object({
    serial: Joi.string()
        .max(100)
        .required()
        .messages({
            "string.base": "Serial number must be a string",
            "string.max": "Serial number must not exceed 100 characters",
            "string.empty": "Serial number is required",
        }),

    model: Joi.string()
        .valid(...Object.values(DroneModelEnum))
        .required()
        .messages({
            "any.only": `Model must be one of: ${Object.values(DroneModelEnum).join(", ")}`,
            "string.empty": "Model is required",
        }),

    weightLimit: Joi.number()
        .positive()
        .max(500)
        .required()
        .messages({
            "number.base": "Weight limit must be a number",
            "number.positive": "Weight limit must be a positive number",
            "number.max": "Weight limit must not exceed 500 grams",
            "any.required": "Weight limit is required",
        }),

    batteryCapacity: Joi.number()
        .integer()
        .min(0)
        .max(100)
        .optional()
        .messages({
            "number.base": "Battery capacity must be a number",
            "number.min": "Battery capacity cannot be less than 0%",
            "number.max": "Battery capacity cannot exceed 100%",
        }),

    state: Joi.string()
        .valid(...Object.values(DroneStateEnum))
        .optional()
        .messages({
            "any.only": `State must be one of: ${Object.values(DroneStateEnum).join(", ")}`,
        }),
});

export const medicationSchema = Joi.object({
    name: Joi.string()
        .pattern(/^[A-Za-z0-9_-]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Only letters, numbers, underscores, and hyphens are allowed on the name',
            'string.empty': 'name is required',
        }),

    weight: Joi.number()
        .integer()
        .positive()
        .max(500)
        .required()
        .messages({
            'number.base': 'Weight must be a number',
            'number.integer': 'Weight must be an integer',
            'number.positive': 'Weight must be a positive number',
            'number.max': 'Weight must be less than or equal to 500',
            'any.required': 'Weight is required',
        }),

    code: Joi.string()
        .pattern(/^[A-Z0-9_]+$/)
        .required()
        .messages({
            'string.pattern': 'Only upper case letters, underscore and numbers are allowed on the code',
            'string.empty': 'code is required',
        }),

    pickupNumber: Joi.string()
        .pattern(/^(?:\+234|234|0)(?:70|80|81|90|91|70|71)\d{8}$/)
        .required()
        .messages({
            "string.pattern.base": "Pickup phone number must be a valid Nigerian number",
            "string.empty": "Pickup phone number is required",
        }),

    deliverNumber: Joi.string()
        .pattern(/^(?:\+234|234|0)(?:70|80|81|90|91|70|71)\d{8}$/)
        .required()
        .messages({
            "string.pattern.base": "Delivery phone number must be a valid Nigerian number",
            "string.empty": "Delivery phone number is required",
        }),

    address: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .pattern(/^[a-zA-Z0-9\s,.\-\/#]+$/)
        .required()
        .messages({
            'string.pattern.base': "Address can only contain letters, numbers, spaces, commas, periods, slashes, and hyphens",
            'string.min': 'Must be a valid address',
            'string.max': 'Must not be more than 200 character',
            'string.empty': 'Address is required',
        }),

    medicationImage: Joi.string()
        .uri()
        .required()
        .messages({
            'string.base': 'Must be a valid base64 or image url',
            'string.empty': 'Medication image is required',
        }),
});

export const loadMedicationSchema = Joi.array()
    .items(medicationSchema)
    .min(1) // optional: at least 1 item
    .messages({
        'array.base': 'Medications must be an array',
        'array.min': 'At least one medication object is required',
    });
