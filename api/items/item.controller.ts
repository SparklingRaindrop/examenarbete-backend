import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import Status from '../../types/api';
import Error from '../../types/error';
import { isAvailableUnit } from '../units/units.model';
import { addItem, editItem, getItem, getItems, isDuplicatedName } from './item.model';

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

export async function getOne(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: itemId } = req.params;

    try {
        const data = await getItem(id, itemId);
        if (!data) {
            res.status(Status.NotFound).send();
            return;
        }

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}

export async function add(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { name, unit_id } = req.body;

    if (!name || !unit_id) {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }
    try {
        const newItemName = name.toLowerCase();

        // Checking data
        if (await isDuplicatedName(id, newItemName)) {
            res.status(Status.BadRequest).send({
                error: 'There is an item with the same name.'
            });
            return;
        }

        if (!await isAvailableUnit(id, unit_id)) {
            res.status(Status.BadRequest).send('Couldn\'t find a unit with the provided unit_id.');
            return;
        }

        const newItem = {
            id: uuid(),
            name: newItemName,
            unit_id,
            user_id: id,
        };

        const addedItem = await addItem(newItem);
        res.status(Status.Created).send(addedItem);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: itemId } = req.params;
    const { name, unit_id } = req.body;

    try {
        const newItemName = name.toLowerCase();

        // Checking data
        if (await isDuplicatedName(id, newItemName)) {
            res.status(Status.BadRequest).send({
                error: 'An item with the provided name already exists.'
            });
            return;
        }
        if (!await isAvailableUnit(id, unit_id)) {
            res.status(Status.BadRequest).send('Couldn\'t find a unit with the provided unit_id.');
            return;
        }

        const newItem = {
            name: newItemName,
            unit_id,
        };

        await editItem(id, itemId, newItem);
        res.status(Status.Succuss).send();
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}