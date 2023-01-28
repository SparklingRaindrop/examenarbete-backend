import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import Status from '../../types/api';
import Error from '../../types/error';
//import { getCategories } from '../categories/categories.model';
import { addIngredients, getIngredients, updateIngredient } from '../ingredients/ingredients.model';
import { addInstruction, getInstructions, updateInstruction } from '../instructions/instructions.model';
import { addRecipe, getRecipe, getRecipes, removeRecipe, updateRecipe } from './recipes.model';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { keyword } = req.query;

    const recipes = await getRecipes(id, keyword as string).catch((err) => next(err));
    if (!recipes || recipes.length === 0) {
        // When nothing matches return an empty array
        res.send([]);
        return;
    }

    // Adding ingredients & instructions
    const result = await Promise.all(recipes.map(async (recipe) => {
        const ingredients = await getIngredients(id, recipe.id);
        const instruction = await getInstructions(id, recipe.id);
        const casted = recipe as RecipeResponse;
        casted.ingredients = ingredients ? ingredients : [];
        casted.instructions = instruction;
        return casted;
    })).catch((err) => next(err));

    res.send(result);
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: recipeId } = req.params;

    const recipe = await getRecipe(id, recipeId).catch((err) => next(err));
    if (!recipe) {
        res.status(Status.NotFound).send();
        return;
    }

    const result = recipe as RecipeResponse;

    // Adding ingredients
    const ingredients = await getIngredients(id, recipe.id).catch((err) => next(err));
    const instructions = await getInstructions(id, recipe.id).catch((err) => next(err));
    result.ingredients = ingredients ? ingredients : [];
    result.instructions = instructions ? instructions : [];

    res.send(result);
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: recipeId } = req.params;

    const deletedCount = await removeRecipe(id, recipeId).catch((err) => next(err));
    if (!deletedCount) {
        res.status(Status.NotFound).send();
        return;
    }
    res.status(Status.NoContent).send();
}

// TODO: Re-think for when something happens in the middle of procedure.
export async function add(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { title, ingredients, instructions } = req.body;

    if (!title || !ingredients || !instructions) {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    const newRecipe = {
        id: uuid(),
        title,
    };

    // Add instructions
    const newInstructions = (instructions as Omit<Instruction, 'user_id'>[]).map(item => ({
        id: uuid(),
        step_no: item.step_no,
        instruction: item.instruction,
        recipe_id: newRecipe.id,
    }));
    await addInstruction(id, newInstructions).catch((err) => next(err));
    // Add ingredients
    const newIngredients = (ingredients as Ingredient[]).map(item => ({
        id: uuid(),
        amount: item.amount,
        item_id: item.item_id,
        recipe_id: newRecipe.id,
    }));
    await addIngredients(newIngredients).catch((err) => next(err));

    //Add recipe
    const result = await addRecipe(id, newRecipe).catch((err) => next(err));
    res.status(Status.Created).send(result);
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { id: recipeId } = req.params;
    const { title, ingredients, instructions } = req.body;

    if (!title && !ingredients && !instructions) {
        res.status(Status.BadRequest).send({
            error: Error.MissingData,
        });
        return;
    }

    const newRecipeData = {
        title,
    };

    // Update instructions
    await Promise.all([...instructions as Omit<Instruction, 'user_id'>[]].map(async ({ step_no, instruction }) => {
        const newData = {
            instruction,
            step_no
        };
        await updateInstruction(id, recipeId, newData);
    })).catch((err) => next(err));

    const newIngredients = (ingredients as Ingredient[]).map(item => ({
        id: uuid(),
        amount: item.amount,
        item_id: item.item_id,
        recipe_id: recipeId,
    }));

    await Promise.all([...newIngredients as Partial<Ingredient>[]].map(async (newIngredient) =>
        updateIngredient(recipeId, newIngredient)
    )).catch((err) => next(err));

    //Update recipe
    await updateRecipe(id, recipeId, newRecipeData);

    res.status(Status.Succuss).send();
}