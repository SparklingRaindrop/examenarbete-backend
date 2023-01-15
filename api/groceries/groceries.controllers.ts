import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import Status from '../../types/api';
import { default as ErrorMsg } from '../../types/error';

import { updateItem, getItem } from '../items/item.model';
import { addGrocery, updateGrocery, getGroceries, getGrocery, newData, removeGrocery } from './groceries.model';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const data = await getGroceries(id)
        .catch((err) => {
            next(err);
            return;
        });

    const parsedData = data?.map(item => {
        item.isChecked = item.isChecked === 0 ? false : true;
        return item;
    });

    res.json(parsedData);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: groceryId } = req.params;

    const deletedCount = await removeGrocery(id, groceryId)
        .catch((err) => {
            next(err);
            return;
        });

    if (!deletedCount) {
        res.status(Status.NotFound).send();
        return;
    }

    res.status(Status.NoContent).send();
}

// TODO: this has to be updated later. Item should be added by ID
export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { item_id, amount, isChecked } = req.body;
    if (typeof amount === 'undefined' || typeof item_id === 'undefined') {
        res.status(Status.BadRequest).send({
            error: ErrorMsg.MissingData,
        });
        return;
    }

    const targetItem = await getItem(id, item_id)
        .catch((err) => {
            next(err);
            return;
        });
    if (!targetItem) {
        res.status(Status.NotFound).send({
            error: 'Couldn\'t find the item with the provided item_id',
        });
        return;
    }

    const newData = {
        id: uuid(),
        item_id,
        amount: amount || 0,
        updated_at: new Date(),
        isChecked: isChecked || false,
    };

    const addedData = await addGrocery(id, newData)
        .catch((err) => {
            next(err);
            return;
        });
    res.status(Status.Created).send(addedData);
}

// TODO: update later
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: groceryId } = req.params;
    const { amount, isChecked, item_name } = req.body;

    if (!amount && !isChecked && !item_name) {
        res.status(Status.BadRequest).send(ErrorMsg.MissingData);
        return;
    }

    const existingData = await getGrocery(id, groceryId)
        .catch((err) => {
            next(err);
            return;
        });
    if (!existingData) {
        res.status(Status.NotFound).send();
        return;
    }

    const targetItem = await getItem(id, existingData.item_id)
        .catch((err) => {
            next(err);
            return;
        });
    if (item_name && !targetItem?.user_id) {
        res.status(Status.BadRequest).send({
            error: 'You cannot change default item names'
        });
        return;
    }

    if (item_name) {
        await updateItem(id, existingData.item_id, item_name)
            .catch((err) => {
                next(err);
                return;
            });
    }

    const newData: newData = {
        item_id: existingData.item_id,
        updated_at: new Date(),
        amount,
        isChecked,
    };

    if (amount || isChecked) {
        await updateGrocery(groceryId, newData)
            .then(() => res.status(Status.Succuss).send())
            .catch(() => res.status(Status.BadRequest).send());
    }
    res.status(Status.Succuss).send();

}