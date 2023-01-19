import { NextFunction, Request, Response } from 'express';
import Status from '../../types/api';
//import { getCategories } from '../categories/categories.model';
import { getIngredients } from '../ingredients/ingredients.model';
import { getInstructions } from '../instructions/instructions.model';
import { getRecipe, getRecipes, removeRecipe } from './recipes.model';

type Data = Omit<Recipe, 'user_id'> & { ingredients: Ingredient[] };

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

    // Adding ingredients
    const result = await Promise.all(recipes.map(async (recipe) => {
        const ingredients = await getIngredients(id, recipe.id).catch((err) => next(err));
        const casted = recipe as Data;
        casted.ingredients = ingredients ? ingredients : [];
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