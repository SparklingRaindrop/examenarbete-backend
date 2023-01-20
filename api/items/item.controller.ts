import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import Status from '../../types/api';
import Error from '../../types/error';
import { isAvailableUnit } from '../units/units.model';
import { addItem, updateItem, getItem, getItems, isDuplicatedItemName } from './item.model';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { keyword } = req.query;

    const data = await getItems(id, keyword as string).catch((err) => next(err));
    res.json(data);
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: itemId } = req.params;

    const data = await getItem(id, itemId).catch((err) => next(err));
    if (!data) {
        res.status(Status.NotFound).send();
        return;
    }

    res.json(data);
}

export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { name, unit_id } = req.body;

    if (!name || !unit_id) {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    const newItemName = name.toLowerCase();

    // Checking data
    if (await isDuplicatedItemName(id, newItemName).catch((err) => next(err))) {
        res.status(Status.BadRequest).send({
            error: 'There is an item with the same name.'
        });
        return;
    }

    if (!await isAvailableUnit(id, unit_id).catch((err) => next(err))) {
        res.status(Status.BadRequest).send('Couldn\'t find a unit with the provided unit_id.');
        return;
    }

    const newItem = {
        id: uuid(),
        name: newItemName,
        unit_id,
    };

    const addedItem = await addItem(id, newItem).catch((err) => next(err));
    res.status(Status.Created).send(addedItem);
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: itemId } = req.params;
    const { name, unit_id } = req.body;


    const newItemName = name.toLowerCase();

    // Checking data
    if (await isDuplicatedItemName(id, newItemName).catch((err) => next(err))) {
        res.status(Status.BadRequest).send({
            error: 'An item with the provided name already exists.'
        });
        return;
    }
    if (!await isAvailableUnit(id, unit_id).catch((err) => next(err))) {
        res.status(Status.BadRequest).send('Couldn\'t find a unit with the provided unit_id.');
        return;
    }

    const newItem = {
        name: newItemName,
        unit_id,
    };

    await updateItem(id, itemId, newItem).catch((err) => next(err));
    res.status(Status.Succuss).send();
}