import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateSchema(schema: Joi.Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ error: error.details.map(d => d.message) });
        }
        req.body = value; // assign validated data
        next();
    };
}

export function validateQueryParamSchema(schema: Joi.Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            return res.status(400).json({ error: error.details.map(d => d.message) });
        }
        req.params = value; // assign validated data
        next();
    };
}
