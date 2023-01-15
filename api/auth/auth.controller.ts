import { NextFunction, Request, Response } from 'express';
import { Md5 } from 'ts-md5';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import Status from '../../types/api';
import { addUser, getUser, isAvailableEmail, removeUser, updateUser } from './auth.model';
import { default as ErrorMsg } from '../../types/error';
import { activateUserId, deactivateToken } from '../../utils/service.model';

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

    const userData: Pick<User, 'id'> = { id: user.id };
    await activateUserId(user.id)
        .catch((err) => {
            next(err);
            return;
        });

    const token = generateToken(userData);
    res.status(Status.Created).json({ token, expires: getExpiredAt() });

}

function isValidEmail(email: string) {
    const emailRegex = new RegExp('' +
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))/.source +
        /@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.source
    );
    return emailRegex.test(email);
}

function isValidPassword(password: string) {
    // At least one uppercase, one special character, one number,
    // minimum 8 but maximum 15
    const passwordRegex = new RegExp('' +
        /^(?=.*[A-Z])(?=.*\d)/.source +
        /(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,15}$/.source
    );
    return passwordRegex.test(password);
}

function isValidUsername(username: string) {
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