import { Request, Response } from 'express';
import Status from '../../types/api';
import Error from '../../types/error';
import { v4 as uuid } from 'uuid';
import { getRecipe } from '../recipes/recipes.model';
import { addPlan, updatePlan, getPlan, getPlans, removePlan } from './plans.model';
import { MEALS, MealType } from '../../types/unions';

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

async function addRecipeDetails(res: Response, userId: User['id'], plan: Plan) {
    const currentPlan = plan as Omit<Plan, 'recipe_id'> & { recipe_id?: string, recipe?: Omit<Recipe, 'user_id'> };
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
            const currentPlan = plan as Omit<Plan, 'recipe_id'> & { recipe_id?: string, recipe?: Omit<Recipe, 'user_id'> };
            addRecipeDetails(res, id, plan);
            return currentPlan;
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
        const plan = await getPlan(id, planId);
        addRecipeDetails(res, id, plan);
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
        const deletedCount = await removePlan(id, planId);
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
    try {
        const targetRecipe = await getRecipe(id, recipe_id);
        if (!targetRecipe) {
            res.status(Status.BadRequest).send({
                error: 'Invalid recipe_id.',
            });
            return;
        }

        const newData: Plan = {
            date,
            type,
            recipe_id,
            updated_at: new Date(),
            id: uuid(),
        };

        const addedData = await addPlan(id, newData);
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
    const { id: planId } = req.params;
    const { date, type, recipe_id } = req.body;

    try {
        // Validating plan id & recipe id
        const targetPlan = await getPlan(id, planId);
        const targetRecipe = await getRecipe(id, recipe_id);
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

        await updatePlan(id, planId, { date, type, recipe_id, updated_at: new Date() });
        res.status(Status.Succuss).send();
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: Error.SomethingHappened,
        });
    }
}