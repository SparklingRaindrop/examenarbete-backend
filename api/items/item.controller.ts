import { Request, Response } from 'express';
import Status from '../../types/api';
import { getItems } from './item.model';

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;

    try {
        const data = await getItems(id);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}