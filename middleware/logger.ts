import { NextFunction, Request, Response } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
        console.info('\x1b[34m%s\x1b[0m',
            `Request On:"${req.originalUrl}" | Request Type: ${req.method} | Status: ${res.statusCode} | time: ${Date.now()}`
        );
    });
    next();
}