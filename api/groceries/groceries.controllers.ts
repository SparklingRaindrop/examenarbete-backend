import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { Error, Status } from '../../types/api';

import { addItem, getItemByName } from '../items/item.model';
import { addGrocery, editGrocery, getGroceries, getGrocery, removeGrocery } from './groceries.model';

export async function getAll(_: Request, res: Response): Promise<void> {
    const data = await getGroceries();
    const parsedData = data?.map(item => {
        item.isChecked = item.isChecked === 0 ? false : true;
        return item;
    });
    res.json(parsedData);
}

export async function remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await removeGrocery(id as unknown as Pick<Grocery, 'id'>)
        .then(() => res.status(Status.NoContent).send())
        .catch(() => res.status(Status.BadRequest).send());
}

// TODO: this has to be updated later. Item should be added by ID
export async function add(req: Request, res: Response): Promise<void> {
    const { name, amount, isChecked, updated_at } = req.body;
    if (typeof amount === 'undefined') {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    // TODO: Item should be found by ID, NOT NAME
    // FROM HERE
    const targetItem = await getItemByName(name as unknown as Pick<Item, 'name'>);
    let item_id = '';
    if (!targetItem) {
        const newItem = {
            id: uuid(),
            name: name,
        };
        const addedItem = await addItem(newItem);
        if (addedItem) {
            item_id = addedItem.id;
        } else {
            res.status(Status.BadRequest).send({
                error: Error.Unsuccessful,
            });
        }
    } else {
        item_id = targetItem.id;
    }
    // UNTIL HERE

    const newData = {
        id: uuid(),
        item_id: item_id as unknown as Pick<Item, 'id'>,
        amount: amount || 0,
        updated_at: updated_at || new Date(),
        isChecked: isChecked || false,
    };

    await addGrocery(newData)
        .then(() => res.status(Status.Created).send())
        .catch(() => res.status(Status.BadRequest).send());
}


interface Data extends Omit<Item, 'id'> {
    amount?: number;
    isChecked?: boolean;
    item_id: Pick<Item, 'id'>;
}

export async function update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { amount, isChecked, item_id, name }: Data = req.body;

    const existingData = await getGrocery(id as unknown as Pick<Grocery, 'id'>);
    if (!existingData) {
        res.status(Status.NotFound).send({
            error: 'The requested item doesn\'t exist.'
        });
        return;
    }

    const newData = {
        item_id: item_id as unknown as Pick<Item, 'id'>,
        updated_at: new Date(),
        name,
        amount,
        isChecked,
    };

    await editGrocery(id as unknown as Pick<Grocery, 'id'>, newData)
        .then(() => res.status(Status.Succuss).send())
        .catch(() => res.status(Status.BadRequest).send());
}