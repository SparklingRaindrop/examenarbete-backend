import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import Status from '../../types/api';
import Error from '../../types/error';
import { isAvailableItem } from '../items/item.model';
import { addStock, getStocks, removeStock, updateStock } from './stocks.model';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;

    const stocks = await getStocks(id).catch((err) => next(err));
    if (!stocks || stocks.length === 0) {
        // When nothing matches return an empty array
        res.send({ recipes: [] });
        return;
    }

    res.send(stocks);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: stockId } = req.params;

    const deletedCount = await removeStock(id, stockId).catch((err) => next(err));
    if (!deletedCount) {
        res.status(Status.NotFound).send();
    }
    res.status(Status.NoContent).send();
}

export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { item_id, amount } = req.body;

    if (typeof amount === 'undefined' || typeof item_id === 'undefined') {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }


    const targetRecipe = await isAvailableItem(id, item_id).catch((err) => next(err));
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

    const addedData = await addStock(id, newData).catch((err) => next(err));
    res.status(Status.Created).send(addedData);
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: stockId } = req.params;
    const { item_id, amount } = req.body;

    if (typeof stockId === 'undefined' || (typeof amount === 'undefined' && typeof item_id === 'undefined')) {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    const newData: Partial<Pick<Stock, 'amount' | 'item_id'>> = {
        amount,
        item_id
    };

    const addedData = await updateStock(id, stockId, newData).catch((err) => next(err));
    res.status(Status.Created).send(addedData);
}