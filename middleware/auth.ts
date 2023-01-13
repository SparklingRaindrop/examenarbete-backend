import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Status from '../types/api';
import { isRemovedToken } from '../utils/service.model';

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

        jwt.verify(token as string, process.env.SECRET_KEY, async (err, decoded) => {

            if (err || !decoded) {
                res.status(Status.Unauthorized).send({
                    error: 'Failed to authenticate user.'
                });
                return;
            }

            const userId = (<{ id: User['id'] }>decoded).id;
            if (await isRemovedToken(userId)) {
                res.status(Status.Unauthorized).send({
                    error: 'Failed to authenticate user.'
                });
                return;
            } else {
                req.user = { id: userId };
                next();
            }
        });
    } else {
        res.status(Status.Forbidden).send({ error: 'No Token Provided.' });
        return;
    }
}