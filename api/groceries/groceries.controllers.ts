import { Request, Response } from 'express';
import { Status } from '../../types/api';

import { add, edit, getAll, getById, remove } from './groceries.model';

interface Data extends Item {
    amount: number;
}

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
    const { id, amount }: Data = req.body;

    const existingData = await getById(id);
    if (!existingData) {
        await add({
            itemId: id,
            amount
        })
            .then(() => res.status(Status.Created).send())
            .catch(() => res.status(Status.BadRequest).send());
        return;
    }

    const sum = existingData.amount + amount;
    const newData = {
        itemId: id,
        amount: sum
    };
    await edit(newData)
        .then(() => res.status(Status.Created).send())
        .catch(() => res.status(Status.BadRequest).send());
}

// update
