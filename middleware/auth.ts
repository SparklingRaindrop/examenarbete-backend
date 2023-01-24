import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Status from '../types/api';
import { isDeactivatedToken } from '../utils/service.model';

dotenv.config();

export async function checkToken(req: Request, res: Response, next: NextFunction) {
    const { access_token } = req.cookies;

    if (access_token) {
        if (!process.env.ACCESS_TOKEN_SECRET_KEY || !process.env.REFRESH_TOKEN_SECRET_KEY) {
            res.status(Status.ServerError).send({
                error: 'Something occurred on the server.'
            });
            throw new Error('Cannot find the key');
        }

        jwt.verify(
            access_token as string,
            process.env.ACCESS_TOKEN_SECRET_KEY,
            async (err, decoded) => {
                if (err || !decoded) {
                    res.status(Status.Unauthorized).send({
                        error: 'Failed to authenticate user. [code: s1]'
                    });
                    return;
                }

                const userId = (<{ id: User['id'] }>decoded).id;
                if (await isDeactivatedToken(userId)) {
                    res.status(Status.Unauthorized).send({
                        error: 'Failed to authenticate user. [code: s2]'
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

/* function refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.body.refresh_token;
    if (!refreshToken) {
      return res.status(401).send("No refresh token");
    }
    const refresh = verifyToken(refreshToken);
    const session = getSession(refresh.sessionId);
    const newAccessToken = signToken(session, "300s");
    if (!newAccessToken) {
      return res.status(401).send("Unable to generate access token");
    }
    const newRefreshToken = signToken(session.sessionId, "1y");
    return res.send({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } */