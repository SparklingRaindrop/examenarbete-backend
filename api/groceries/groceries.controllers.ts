import { Request, Response } from 'express';
import { Status } from '../../types/api';

import { add, getAll, remove } from './groceries.model';

export async function getItems(req: Request, res: Response): Promise<void> {
    const data = await getAll();
    res.json(data);
}

export async function removeItem(req: Request, res: Response): Promise<void> {
    const { itemId } = req.params;
    await remove(itemId)
        .then(() => res.status(Status.NoContent).send())
        .catch(() => res.status(Status.BadRequest).send())
}

// TODO: check if the requested item exists
// TODO: it has to sum up
export async function addItem(req: Request, res: Response): Promise<void> {
    const { id }: { id: string } = req.body;
    await add(id)
        .then(() => res.status(Status.Created).send())
        .catch(() => res.status(Status.BadRequest).send());
}

// update
