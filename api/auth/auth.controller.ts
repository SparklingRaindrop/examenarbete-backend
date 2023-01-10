import { Request, Response } from 'express';
import { Md5 } from 'ts-md5';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { Status } from '../../types/api';
import { getUser } from './auth.model';

dotenv.config();

function generateToken(user: User) {
    if (!process.env.SECRET_KEY) {
        throw new Error('Set SECRET_KY for generating access tokens');
    }
    return jwt.sign(user,
        process.env.SECRET_KEY,
        { expiresIn: process.env.TOKEN_DURATION || '1800s' }
    );
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
    }

    const token = generateToken(user);
    res.json({ token });
}