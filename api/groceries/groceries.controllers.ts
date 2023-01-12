import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import Status from '../../types/api';
import Error from '../../types/error';

import { addItem, editItem, getItem, getItemByName } from '../items/item.model';
import { addGrocery, editGrocery, getGroceries, getGrocery, newData, removeGrocery } from './groceries.model';

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;

    try {
        const data = await getGroceries(id);
        const parsedData = data?.map(item => {
            item.isChecked = item.isChecked === 0 ? false : true;
            return item;
        });
        res.json(parsedData);
    } catch (err) {
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

export async function remove(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: groceryId } = req.params;

    try {
        const deletedCount = await removeGrocery(id, groceryId);
        if (!deletedCount) {
            res.status(Status.NotFound).send();
        }
        res.status(Status.NoContent).send();
    } catch (err) {
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

// TODO: this has to be updated later. Item should be added by ID
export async function add(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { item_name, amount, isChecked, updated_at } = req.body;
    if (typeof amount === 'undefined' || typeof item_name === 'undefined') {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    try {
        // TODO: Item should be found by ID, NOT NAME
        // FROM HERE
        const targetItem = await getItemByName(item_name);
        let item_id = '';
        if (!targetItem) {
            const newItem = {
                id: uuid(),
                name: item_name,
                user_id: id,
            };
            const addedItem = await addItem(newItem);
            if (addedItem) {
                item_id = addedItem.id;
            } else {
                res.status(Status.BadRequest).send({
                    error: Error.SomethingHappened,
                });
            }
        } else {
            item_id = targetItem.id;
        }
        // UNTIL HERE

        const newData = {
            id: uuid(),
            item_id,
            amount: amount || 0,
            updated_at: updated_at || new Date(),
            isChecked: isChecked || false,
        };

        await addGrocery(newData);
        res.status(Status.Created).send();

    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: groceryId } = req.params;
    const { amount, isChecked, item_name } = req.body;

    try {
        const existingData = await getGrocery(id, groceryId);
        if (!existingData) {
            res.status(Status.NotFound).send({
                error: 'The requested item doesn\'t exist.'
            });
            return;
        }

        const targetItem = await getItem(id, existingData.item_id);
        if (item_name && !targetItem?.user_id) {
            res.status(Status.BadRequest).send({
                error: 'You cannot change default item names'
            });
            return;
        }

        if (item_name) {
            await editItem(id, existingData.item_id, item_name);
        }

        const newData: newData = {
            item_id: existingData.item_id,
            updated_at: new Date(),
            amount,
            isChecked,
        };

        if (amount || isChecked) {
            await editGrocery(groceryId, newData)
                .then(() => res.status(Status.Succuss).send())
                .catch(() => res.status(Status.BadRequest).send());
        }
        res.status(Status.Succuss).send();

    } catch (error) {
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
        console.error(error);
    }
}