import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Status from '../types/api';

dotenv.config();

export function checkToken(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization;
    const token = authorization?.split(' ')[1];

    if (token) {
        if (!process.env.SECRET_KEY) {
            res.status(Status.ServerError).send({
                error: 'Something occurred on the server.'
            });
            throw new Error('Cannot find the key');
        }

        jwt.verify(token as string, process.env.SECRET_KEY, (err, decoded) => {
            if (err || !decoded) {
                res.status(Status.Unauthorized).send({
                    error: 'Failed to authenticate user.'
                });
            } else {
                req.user = { id: (<{ id: Pick<User, 'id'> }>decoded).id };
                next();
            }
        });
    } else {
        res.status(Status.Forbidden).send({ error: 'No Token Provided.' });
        return;
    }
}