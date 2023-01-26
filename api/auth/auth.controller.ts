import { NextFunction, Request, Response } from 'express';
import { Md5 } from 'ts-md5';
import { v4 as uuid } from 'uuid';
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

import Status from '../../types/api';
import { addUser, getUser, isAvailableEmail, removeUser, updateUser } from './auth.model';
import { activateUserId, deactivateToken } from '../../utils/service.model';

dotenv.config();

function generateToken(
    data: Partial<Pick<User, 'id'> & Partial<Omit<User, 'id'>>>,
    typ: 'refresh' | 'access',
    expiresIn?: SignOptions['expiresIn']
): string {
    if (!process.env.ACCESS_TOKEN_SECRET_KEY || !process.env.REFRESH_TOKEN_SECRET_KEY) {
        throw new Error('SECRET_KEY is undefined!');
    }
    return jwt.sign(data,
        typ === 'access' ? process.env.ACCESS_TOKEN_SECRET_KEY : process.env.REFRESH_TOKEN_SECRET_KEY,
        { expiresIn: expiresIn || process.env.TOKEN_DURATION }
    );
}

function getMinutesFromNow(minutes: number): Date {
    const today = new Date();
    return new Date(today.getTime() + minutes * 60000);
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const user = await getUser({ ...(username ? { username } : { email }) })
        .catch((err) => {
            next(err);
            return;
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

    await activateUserId(user.id)
        .catch((err) => {
            next(err);
            return;
        });


    const userData = {
        id: user.id,
    };

    const accessToken = generateToken(userData, 'access');
    const refreshToken = generateToken({ ...(username ? { username } : { email }) }, 'refresh', '1d');
    // Do not add domain on localhost
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1day
    });


    res.status(Status.Created).send({
        accessToken,
        expires: getMinutesFromNow(5)
    });

}

function isValidEmail(email: string): boolean {
    const emailRegex = new RegExp('' +
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))/.source +
        /@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.source
    );
    return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
    // At least one uppercase, one special character, one number,
    // minimum 8 but maximum 15
    const passwordRegex = new RegExp('' +
        /^(?=.*[A-Z])(?=.*\d)/.source +
        /(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,15}$/.source
    );
    return passwordRegex.test(password);
}

function isValidUsername(username: string): boolean {
    // Begin with an alphabet, can contain only lower, uppercase and numbers
    // minimum 7 but maximum 15
    const usernameRegex = new RegExp(/^[a-zA-Z][a-zA-Z0-9]{7,15}\d*$/);
    return usernameRegex.test(username);
}

export async function createNewUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { username, password, email } = req.body;

    if (!email || !isValidEmail(email)) {
        res.status(Status.BadRequest).json({
            error: 'Email is invalid.',
        });
        return;
    }

    const isUsableEmail = await isAvailableEmail(email).catch((err) => next(err));
    if (!isUsableEmail) {
        res.status(Status.BadRequest).json({
            error: 'Email is already in use.',
        });
        return;
    }

    if (!username || !isValidUsername(username)) {
        res.status(Status.BadRequest).json({
            error: 'Username is invalid or already in use.',
        });
        return;
    }

    if (!password || !isValidPassword(password)) {
        res.status(Status.BadRequest).json({
            error: 'Password is invalid.',
        });
        return;
    }

    const newUser = {
        id: uuid(),
        email,
        username,
        password: Md5.hashStr(password),
    };

    const result = await addUser(newUser).catch((err) => next(err));
    res.status(201).send(result);
}

// TODO: How do I destroy JWT on delete?
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
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

    const user = await getUser({ ...(username ? { username } : { email }) }).catch((err) => next(err));
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

    const deletedCount = await removeUser(id).catch((err) => next(err));
    if (!deletedCount) {
        res.status(Status.NotFound).send();
        return;
    }

    await deactivateToken({
        user_id: id,
        created_at: new Date()
    }).catch((err) => next(err));

    res.status(Status.NoContent).send();
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { username, email, password } = req.body;

    if (email && !await isAvailableEmail(email).catch((err) => next(err))) {
        res.status(Status.BadRequest).json({
            error: 'Email is invalid or already in use.',
        });
        return;
    }

    if (username && !isValidUsername(username)) {
        res.status(Status.BadRequest).json({
            error: 'Username is invalid or already in use.',
        });
        return;
    }

    if (password && !isValidPassword(password)) {
        res.status(Status.BadRequest).json({
            error: 'Password is invalid.',
        });
        return;
    }

    const newData = {
        email,
        username,
        password: Md5.hashStr(password),
    };

    updateUser(id, newData);
    res.status(Status.Succuss).send();
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;

    await deactivateToken({
        user_id: id,
        created_at: new Date()
    }).catch((err) => next(err));
    res.status(Status.Succuss).send();
}

type Decoded = {
    email?: string,
    username?: string,
    iat?: number,
    exp?: number
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies;

    if (!process.env.REFRESH_TOKEN_SECRET_KEY) {
        throw new Error('Provide REFRESH_TOKEN_SECRET_KEY');
    }

    jwt.verify(
        refreshToken as string,
        process.env.REFRESH_TOKEN_SECRET_KEY,
        async (err, decoded) => {
            if (err || !decoded) {
                res.status(Status.Unauthorized).send({
                    error: 'Failed to authenticate user. [code: s1]'
                });
                return false;
            }

            const decodedRefreshKey = (<Decoded>decoded);
            const key = { ...decodedRefreshKey };
            delete key.iat;
            delete key.exp;
            const user = await getUser(key as Pick<User, 'username'> | Pick<User, 'email'>).catch((err) => next(err));
            if (!user) {
                res.status(Status.Unauthorized).send({
                    error: 'Failed to authenticate user. [code: s2]'
                });
                return;
            } else {
                const accessToken = generateToken({ id: user.id, }, 'access');
                const refreshToken = generateToken(key, 'refresh', '1d');
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000 // 1day
                });

                res.status(Status.Created).send({
                    accessToken,
                    refreshToken,
                    expires: getMinutesFromNow(5)
                });
                return;
            }
        }
    );
}