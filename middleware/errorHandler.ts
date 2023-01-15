import { Request, Response } from 'express';

interface ExpressError extends Error {
    code?: number;
}

// TODO: write log after this
export function handleError(err: ExpressError, req: Request, res: Response, next: any) {
    const { id } = req.user;

    console.error('\x1b[42m%s\x1b[0m', `${err.code} - on a request by ${id}`);
    console.error('\x1b[1m%s\x1b[0m', err.stack);
    console.info(err.message);
    res.status(500).send('Something broke!');
}