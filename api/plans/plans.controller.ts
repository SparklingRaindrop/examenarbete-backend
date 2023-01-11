import { Request, Response } from 'express';
import Status from '../../types/api';
import { getRecipesById } from '../recipes/recipes.model';
import { getPlans, removePlan } from './plans.model';

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

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { range } = req.body;

    // Data validation
    if (range && (!isValidDate(range.from) || !isValidDate(range.from))) {
        res.status(Status.BadRequest).send({
            error: 'Received invalid type of data.'
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
            error: 'Something occurred on the server.'
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
    } catch (err) {
        res.status(Status.BadRequest).send();
    }
}