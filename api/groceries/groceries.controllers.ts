import { Request, Response } from 'express';
import { Error, Status } from '../../types/api';

import { add, edit, getAll, getById, remove } from './groceries.model';

interface Data extends Item {
    amount?: number;
    isChecked?: boolean;
}

export async function getGroceries(_: Request, res: Response): Promise<void> {
    const data = await getAll();
    const parsedData = data?.map(item => {
        item.isChecked = item.isChecked === 0 ? false : true;
        return item;
    });
    res.json(parsedData);
}

export async function removeGrocery(req: Request, res: Response): Promise<void> {
    const { itemId } = req.params;
    await remove(itemId)
        .then(() => res.status(Status.NoContent).send())
        .catch(() => res.status(Status.BadRequest).send());
}

// TODO: check if the requested item exists
// TODO: it has to sum up
export async function addGrocery(req: Request, res: Response): Promise<void> {
    const { id, amount }: Data = req.body;

    const existingData = await getById(id);
    if (!amount) {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }
    if (existingData) {
        res.status(Status.BadRequest).send({
            error: Error.AlreadyExist,
            message: 'Try again with POST or PATCH method to update.'
        });
        return;
    }

    const newData = {
        item_id: id,
        amount: amount,
        updated_at: new Date(),
        isChecked: false
    };
    await add(newData)
        .then(() => res.status(Status.Created).send())
        .catch(() => res.status(Status.BadRequest).send());
}

export async function updateGrocery(req: Request, res: Response): Promise<void> {
    const { itemId: id } = req.params;
    const { amount, isChecked }: Data = req.body;

    const existingData = await getById(id);
    if (!existingData) {
        res.status(Status.NotFound).send({
            error: 'The requested item doesn\'t exist.'
        });
        return;
    }

    const newData = {
        item_id: id,
        amount,
        isChecked,
        updated_at: new Date(),
    };
    await edit(newData)
        .then(() => res.status(Status.Succuss).send())
        .catch(() => res.status(Status.BadRequest).send());
}