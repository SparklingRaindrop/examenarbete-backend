import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import Status from '../../types/api';
import Error from '../../types/error';
import { getUnits } from './units.model';

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;

    try {
        const result = await getUnits(id);
        res.json(result);
    } catch (err) {
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}
