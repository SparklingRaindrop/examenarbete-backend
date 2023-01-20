import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import Status from '../../types/api';
import Error from '../../types/error';
//import { getCategories } from '../categories/categories.model';
import { addIngredients, getIngredients, updateIngredient } from '../ingredients/ingredients.model';
import { addInstruction, getInstructions, updateInstruction } from '../instructions/instructions.model';
import { addRecipe, getRecipe, getRecipes, removeRecipe, updateRecipe } from './recipes.model';

type Data = Omit<Recipe, 'user_id'> & { ingredients: Ingredient[] } & {
    instructions?: Omit<Instruction, 'user_id' | 'recipe_id'>[]
};

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { keyword } = req.query;

    const recipes = await getRecipes(id, keyword as string).catch((err) => next(err));
    if (!recipes || recipes.length === 0) {
        // When nothing matches return an empty array
        res.send([]);
        return;
    }

    // Adding category
    /* const categoryList = await getCategories(id);
    if (categoryList) {
        result = result.map(recipe => {
            const { id: recipeId } = recipe;
            const category = categoryList.filter(category =>
                category.recipe_id === recipeId
            );
            category.forEach(c => delete c.recipe_id);
            recipe.category = category;

            return recipe;
        });
    } */

    // Adding ingredients & instructions
    const result = await Promise.all((recipes).map(async (recipe) => {
        const ingredients = await getIngredients(id, recipe.id).catch((err) => next(err));
        const instruction = await getInstructions(id, recipe.id);
        const casted = recipe as Data;
        casted.ingredients = ingredients ? ingredients : [];
        casted.instructions = instruction;
        return casted;
    }));

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

    const result = recipe as Recipe & {
        category?: Omit<CategoryList, 'recipe_id'>[],
        ingredients?: Ingredient[];
        instructions?: Omit<Instruction, 'user_id' | 'recipe_id'>[];
    };

    // Adding category
    /* const categoryList = await getCategories(id);
    if (categoryList) {
        result = result.map(recipe => {
            const { id: recipeId } = recipe;
            const category = categoryList.filter(category =>
                category.recipe_id === recipeId
            );
            category.forEach(c => delete c.recipe_id);
            recipe.category = category;

            return recipe;
        });
    } */

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

    /*     const newIngredients = (ingredients as Ingredient[]).map(item => ({
            id: uuid(),
            amount: item.amount,
            item_id: item.item_id,
            recipe_id: recipeId,
        }));
        await updateIngredient(id, recipeId, newIngredients).catch((err) => next(err)); */


    //Update recipe
    await updateRecipe(id, recipeId, newRecipeData);

    res.status(Status.Succuss).send();
}