import { NextFunction, Request, Response } from 'express';
import Status from '../types/api';
import Error from '../types/error';

// TODO: write log after this
export function handleKnexError(err: KnexError, req: Request, res: Response, next: NextFunction) {
    const { id } = req.user;

    console.error('\x1b[42m%s\x1b[0m', `${err.code} - on a request by ${id}`);
    console.error('\x1b[1m%s\x1b[0m', err.stack);
    console.info(err.message);

    res.status(Status.ServerError).send(Error.SomethingHappened);
}