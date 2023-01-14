import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import Status from '../../types/api';
import Error from '../../types/error';
import { isAvailableItem } from '../items/item.model';
import { addStock, getStocks, removeStock, updateStock } from './stocks.model';

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;

    try {
        const stocks = await getStocks(id);
        if (!stocks || stocks.length === 0) {
            // When nothing matches return an empty array
            res.send({ recipes: [] });
            return;
        }

        res.send(stocks);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}

export async function remove(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: stockId } = req.params;

    try {
        const deletedCount = await removeStock(id, stockId);
        if (!deletedCount) {
            res.status(Status.NotFound).send();
        }
        res.status(Status.NoContent).send();
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

export async function add(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { item_id, amount } = req.body;

    if (typeof amount === 'undefined' || typeof item_id === 'undefined') {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    try {
        const targetRecipe = await isAvailableItem(id, item_id);
        if (!targetRecipe) {
            res.status(Status.BadRequest).send({
                error: 'Invalid item id.',
            });
            return;
        }

        const newData: Omit<Stock, 'user_id'> = {
            amount,
            item_id,
            id: uuid(),
        };

        const addedData = await addStock(id, newData);
        res.status(Status.Created).send(addedData);

    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

export async function update(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: stockId } = req.params;
    const { item_id, amount } = req.body;

    if (typeof stockId === 'undefined' || (typeof amount === 'undefined' && typeof item_id === 'undefined')) {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    try {
        const newData: Partial<Pick<Stock, 'amount' | 'item_id'>> = {
            amount,
            item_id
        };

        const addedData = await updateStock(id, stockId, newData);
        res.status(Status.Created).send(addedData);

    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}