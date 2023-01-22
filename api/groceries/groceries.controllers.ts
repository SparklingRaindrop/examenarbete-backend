import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import Status from '../../types/api';
import { default as ErrorMsg } from '../../types/error';
import { getIngredients } from '../ingredients/ingredients.model';

import { getItem } from '../items/item.model';
import { getPlans } from '../plans/plans.model';
import { getStocks } from '../stocks/stocks.model';
import {
    addGrocery,
    updateGrocery,
    getGroceries,
    getGrocery,
    removeGrocery,
    removeAllGroceries,
    GroceryNewData
} from './groceries.model';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;

    const data = await getGroceries(id).catch((err) => next(err));
    if (!data || data.length === 0) {
        res.json([]);
        return;
    }

    const parsedData = data.map(item => {
        item.isChecked = item.isChecked === 0 ? false : true;
        return item;
    });

    res.json(parsedData);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: groceryId } = req.params;

    const deletedCount = await removeGrocery(id, groceryId).catch((err) => next(err));

    if (!deletedCount) {
        res.status(Status.NotFound).send();
        return;
    }

    res.status(Status.NoContent).send();
}

export async function removeAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;

    const deletedCount = await removeAllGroceries(id).catch((err) => next(err));

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

    const targetItem = await getItem(id, item_id).catch((err) => next(err));
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

    const addedData = await addGrocery(id, newData).catch((err) => next(err));
    res.status(Status.Created).send(addedData);
}

// TODO: update later
export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: groceryId } = req.params;
    const { amount, isChecked } = req.body;

    if (!amount && typeof isChecked === 'undefined') {
        res.status(Status.BadRequest).send(ErrorMsg.MissingData);
        return;
    }

    const existingData = await getGrocery(id, groceryId).catch((err) => next(err));
    if (!existingData) {
        res.status(Status.NotFound).send();
        return;
    }

    const newData: GroceryNewData = {
        updated_at: new Date(),
        amount,
        isChecked,
    };

    if (amount || typeof isChecked !== 'undefined') {
        await updateGrocery(groceryId, newData)
            .then(() => res.status(Status.Succuss).send())
            .catch(() => res.status(Status.BadRequest).send());
    }
    res.status(Status.Succuss).send();
}

function getDefaultDate() {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, 0);
    const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59, 59);
    return { from, to };
}

function subtractStocks(ingredients: IngredientResponse[], stocks: StockResponse[]): IngredientResponse[] {
    return ingredients.reduce((result: IngredientResponse[], currentItem, index) => {
        const itemInStock = stocks.find(({ item }) => item.id === currentItem.id);
        if (itemInStock) {
            currentItem.amount = ingredients[index].amount - itemInStock.amount;
        }
        result.push(currentItem);
        return result;
    }, []);
}

function parseData(data: IngredientResponse[]): Omit<Grocery, 'user_id'>[] {
    return data.map(({ item, amount }) => ({
        id: uuid(),
        updated_at: new Date(),
        amount: amount,
        isChecked: false,
        item_id: item.id,
    }));
}

export async function generateGroceries(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { from, to } = req.body;

    const plans = await getPlans(
        id,
        from && to ? { from, to } : getDefaultDate(),
    ).catch((err) => next(err));

    if (plans && plans.length === 0) {
        res.status(Status.Succuss).send([]);
    } else if (!plans) {
        throw new Error('GetPlan returned nothing!');
    }

    const recipeIdList = plans.map(({ recipe }) => recipe.id);
    const ingredients = await getIngredients(id, recipeIdList).catch((err) => next(err));

    if (!ingredients || ingredients.length === 0) {
        throw new Error('GetPlan returned nothing!');
    }

    // calculate
    const stocks = await getStocks(id);
    const result = subtractStocks(ingredients, stocks);

    const addedData = await addGrocery(id, parseData(result));
    res.status(Status.Created).send(addedData);
}