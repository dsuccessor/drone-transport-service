
export class AppError extends Error {
    code?: string;
    statusCode?: number;

    constructor(message: string, statusCode?: number, code?: string) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
