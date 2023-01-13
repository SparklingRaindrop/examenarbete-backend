import { Request, Response } from 'express';
import Status from '../../types/api';
import { getCategories } from '../categories/categories.model';
import { getIngredients } from '../ingredients/ingredients.model';
import { getRecipe, getRecipes } from './recipes.model';

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;

    try {
        const recipes = await getRecipes(id);
        if (!recipes || recipes.length === 0) {
            // When nothing matches return an empty array
            res.send({ recipes: [] });
            return;
        }

        let result = recipes as Array<Recipe & {
            category?: Omit<CategoryList, 'recipe_id'>[],
            ingredients?: Ingredient[];
        }>;

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
        result = await Promise.all(result.map(async (recipe) => {
            const ingredients = await getIngredients(id, recipe.id);
            recipe.ingredients = ingredients;
            return recipe;
        }));

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}

export async function getOne(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { id: recipeId } = req.params;

    try {
        const recipe = await getRecipe(id, recipeId);
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
        const ingredients = await getIngredients(id, recipe.id);
        result.ingredients = ingredients;

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}