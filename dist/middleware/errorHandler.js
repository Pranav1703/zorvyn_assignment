export class AppError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const globalErrorHandler = (err, req, res, next) => {
    console.log("[global err handler] ", err.message, " : ", err.stack);
    err.statusCode = err.statusCode || 500;
    let message = 'Internal Server Error';
    if (err instanceof AppError) {
        message = err.message;
    }
    res.status(err.statusCode).json({
        message: message,
    });
};
//# sourceMappingURL=errorHandler.js.map