import { NextFunction, Request, Response } from "express";
import { AppError } from "./error-handler.util";

export function handleError() {
    return (err: any, req: Request, res: Response, next: NextFunction) => {
        const error = {
            message: err?.message ?? 'Internal Server Error',
            statusCode: 500
        }

        if (err instanceof AppError && err.statusCode) {
            error.statusCode = err.statusCode;
        }

        console.error(`Error code: ${error.statusCode}, message: ${error.message}`);

        return res.status(error.statusCode).json({ success: false, status: 'failed', error: error.message });
    }
}