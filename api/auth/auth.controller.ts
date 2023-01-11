import { Request, Response } from 'express';
import { Md5 } from 'ts-md5';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import Status from '../../types/api';
import { getUser } from './auth.model';

dotenv.config();

function generateToken(data: Pick<User, 'id'>) {
    if (!process.env.SECRET_KEY) {
        throw new Error('Set SECRET_KY for generating access tokens');
    }
    return jwt.sign(data,
        process.env.SECRET_KEY,
        { expiresIn: process.env.TOKEN_DURATION || '1800s' }
    );
}

function getExpiredAt() {
    const time = new Date();
    const limit = process.env.TOKEN_DURATION ? Number(process.env.TOKEN_DURATION.replace(/[^0-9]/g, '')) : 1800;
    return time.setSeconds(time.getSeconds() + limit);
}

export async function login(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;
    if (!email && !username) {
        res.status(Status.BadRequest).send({
            error: 'Provide either username or email.'
        });
        return;
    } else if (!password) {
        res.status(Status.BadRequest).send({
            error: 'Password is required.'
        });
        return;
    }

    const user = await getUser({
        ...(username ? { username } : { email })
    });
    if (!user) {
        res.status(Status.BadRequest).send({
            error: 'The provided information is incorrect.'
        });
        return;
    }

    const hashedPassword = Md5.hashStr(password);
    if (user.password !== hashedPassword) {
        res.status(Status.Forbidden).send({
            error: 'Password is incorrect.'
        });
        return;
    }

    const userData: Pick<User, 'id'> = { id: user.id };

    const token = generateToken(userData);
    res.status(Status.Created).json({ token, expires: getExpiredAt() });
}