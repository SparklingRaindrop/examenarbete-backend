import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import Status from '../../types/api';
import Error from '../../types/error';
import { hasItemWithUnitId } from '../items/item.model';
import { addUnit, getUnits, isDuplicatedUnit, removeUnit } from './units.model';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;

    try {
        const result = await getUnits(id).catch((err) => next(err));
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: unitId } = req.params;

    try {
        // If item is registered with the unit_id
        if (await hasItemWithUnitId(id, unitId).catch((err) => next(err))) {
            res.status(Status.BadRequest).send({
                error: 'Couldn\'t delete the unit'
            });
            return;
        }

        const deletedCount = await removeUnit(id, unitId).catch((err) => next(err));
        if (!deletedCount) {
            res.status(Status.NotFound).send();
            return;
        }

        res.status(Status.NoContent).send();
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { name } = req.body;

    if (!name) {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    try {
        const newUnitName = name.toLowerCase();

        // Checking data
        if (await isDuplicatedUnit(id, newUnitName).catch((err) => next(err))) {
            res.status(Status.BadRequest).send({
                error: 'This unit already exists.'
            });
            return;
        }

        const newItem = {
            id: uuid(),
            name: newUnitName,
        };

        const addedItem = await addUnit(id, newItem).catch((err) => next(err));
        res.status(Status.Created).send(addedItem);

    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}