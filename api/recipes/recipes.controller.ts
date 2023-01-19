import { NextFunction, Request, Response } from 'express';
import Status from '../../types/api';
//import { getCategories } from '../categories/categories.model';
import { getIngredients } from '../ingredients/ingredients.model';
import { getRecipe, getRecipes } from './recipes.model';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.user;
    const { keyword } = req.query;

    const recipes = await getRecipes(id, keyword as string).catch((err) => next(err));
    if (!recipes || recipes.length === 0) {
        // When nothing matches return an empty array
        res.send([]);
        return;
    }

    res.send(recipes);
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
    result.ingredients = ingredients ? ingredients : [];

    res.send(result);
}