import { NextFunction, Request, Response } from 'express';
import Status from '../../types/api';
import Error from '../../types/error';
import { v4 as uuid } from 'uuid';
import { getRecipe } from '../recipes/recipes.model';
import { addPlan, updatePlan, getPlan, getPlans, removePlan } from './plans.model';
import { MEALS, MealType } from '../../types/unions';

function isValidDate(date: string) {
    if (/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/.test(date)) {
        const [day, month, year] = date.split('-');
        // Month is literal
        return new Date(Number(year), Number(month) - 1, Number(day)).toString() !== 'Invalid Date';
    } else {
        return new Date(date).toString() !== 'Invalid Date';
    }
}

function isMealType(mealType: string): mealType is MealType {
    return MEALS.includes(mealType as MealType);
}

async function addRecipeDetails(res: Response, userId: User['id'], plan: Plan) {
    const currentPlan = plan as Omit<Plan, 'recipe_id'> & {
        recipe_id?: string, recipe?: Omit<Recipe, 'user_id'>
    };
    const { recipe_id } = plan;
    if (!recipe_id) {
        console.error('A plan should contain recipe_id.');
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
        return;
    }

    const recipe = await getRecipe(userId, recipe_id);
    currentPlan.recipe = recipe;
    delete currentPlan.recipe_id;
    return currentPlan;
}

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { start, end } = req.query;
    const range: { from: Date | null, to: Date | null } = {
        from: null,
        to: null
    };

    if (start && end) {
        if (typeof start !== 'string' || typeof end !== 'string') {
            res.status(Status.BadRequest).send();
            return;
        } else if (!isValidDate(start) || !isValidDate(end)) {
            res.status(Status.BadRequest).send();
            return;
        }
        const [startDay, startMonth, startYear] = start.split('-');
        const [endDay, endMonth, endYear] = end.split('-');
        // Month is literal
        range.from = new Date(Number(startYear), Number(startMonth) - 1, Number(startDay), 0, 0, 0, 0);
        range.to = new Date(Number(endYear), Number(endMonth) - 1, Number(endDay), 23, 59, 59, 59);
    }

    const plans = await getPlans(id, range).catch((err) => next(err));
    if (!plans || plans.length === 0) {
        res.json([]);
        return;
    }

    /*     // Adding recipe data
        const result = await Promise.all([...plans].map(async (plan) => {
            const planWithRecipeDetails = await addRecipeDetails(res, id, plan);
            return planWithRecipeDetails;
        })).catch((err) => next(err)); */

    res.json(plans);
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: planId } = req.params;

    const plan = await getPlan(id, planId).catch((err) => next(err));
    if (!plan) {
        res.status(Status.NotFound).send();
        return;
    }

    const planWithRecipeDetails = await addRecipeDetails(res, id, plan).catch((err) => next(err));
    res.json(planWithRecipeDetails);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: planId } = req.params;

    const deletedCount = await removePlan(id, planId).catch((err) => next(err));
    if (!deletedCount) {
        res.status(Status.NotFound).send();
        return;
    }
    res.status(Status.NoContent).send();
}

export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { date, type, recipe_id } = req.body;

    if (typeof date === 'undefined' || typeof recipe_id === 'undefined' || typeof type === 'undefined') {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    if (!isValidDate(date) || !isMealType(type)) {
        res.status(Status.BadRequest).send({
            error: Error.InvalidDataType,
        });
        return;
    }

    const targetRecipe = await getRecipe(id, recipe_id).catch((err) => next(err));
    if (!targetRecipe) {
        res.status(Status.BadRequest).send({
            error: 'Invalid recipe_id.',
        });
        return;
    }

    const newData: Plan = {
        date: new Date(date).getTime(),
        type,
        recipe_id,
        updated_at: new Date(),
        id: uuid(),
    };

    const addedData = await addPlan(id, newData).catch((err) => next(err));
    res.status(Status.Created).send(addedData);
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: planId } = req.params;
    const { date, type, recipe_id } = req.body;


    // Validating plan id & recipe id
    const targetPlan = await getPlan(id, planId).catch((err) => next(err));
    const targetRecipe = await getRecipe(id, recipe_id).catch((err) => next(err));
    if (!targetPlan || !targetRecipe) {
        res.status(Status.NotFound).send();
        return;
    }

    // Validating incoming
    if ((date && !isValidDate(date)) || (type && !isMealType(type))) {
        res.status(Status.BadRequest).send({
            error: Error.InvalidDataType,
        });
        return;
    }

    await updatePlan(id, planId, { date, type, recipe_id, updated_at: new Date() }).catch((err) => next(err));
    res.status(Status.Succuss).send();
}