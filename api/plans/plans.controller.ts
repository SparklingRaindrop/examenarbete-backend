import { Request, Response } from 'express';
import Status from '../../types/api';
import Error from '../../types/error';
import { v4 as uuid } from 'uuid';
import { getRecipesById } from '../recipes/recipes.model';
import { addPlan, getPlan, getPlans, NewPlanData, removePlan } from './plans.model';

function removeTime(range: { from: Date, to: Date }) {
    const start = new Date(range.from);
    const end = new Date(range.to);
    return {
        from: new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
        ),
        to: new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate()
        )
    };
}

function isValidDate(date: Date) {
    return new Date(date).toString() !== 'Invalid Date';
}

function isMealType(mealType: string): mealType is MealType {
    return MEALS.includes(mealType as MealType);
}

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { range } = req.body;

    // Data validation
    if (range && (!isValidDate(range.from) || !isValidDate(range.from))) {
        res.status(Status.BadRequest).send({
            error: Error.InvalidDataType,
        });
        return;
    }

    try {
        const plans = await getPlans(id, range && removeTime(range));

        // Adding recipe data
        const result = await Promise.all([...plans].map(async (plan) => {
            const { recipe_id } = plan;
            if (!recipe_id) {
                plan.recipe = [];
                return plan;
            }

            const recipe = await getRecipesById(id, recipe_id);
            plan.recipe = recipe;
            delete plan.recipe_id;
            return plan;
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

export async function getOne(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: planId } = req.params;

    try {
        const plan = await getPlan(id, planId as unknown as Pick<Plan, 'id'>);

        // Adding recipe data
        const { recipe_id } = plan;
        if (!recipe_id) {
            plan.recipe = [];
        } else {
            const recipe = await getRecipesById(id, recipe_id);
            plan.recipe = recipe;
            delete plan.recipe_id;
        }

        res.json(plan);

    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}

export async function remove(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: planId } = req.params;

    try {
        const deletedCount = await removePlan(id, planId as unknown as Pick<Plan, 'id'>);
        if (!deletedCount) {
            res.status(Status.BadRequest).send();
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
    const { date, type, recipe_id, updated_at } = req.body;

    if (typeof date === 'undefined' || typeof recipe_id === 'undefined' || typeof type === 'undefined') {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    if (!isValidDate(date) || !isValidDate(updated_at) || !isMealType(type)) {
        res.status(Status.BadRequest).send({
            error: Error.InvalidDataType,
        });
        return;
    }

    const newData: NewPlanData = {
        date,
        type,
        recipe_id,
        updated_at: updated_at || new Date(),
        id: uuid(),
    };

    try {
        const addedData = await addPlan(id, newData);
        res.status(Status.Created).send(addedData);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}