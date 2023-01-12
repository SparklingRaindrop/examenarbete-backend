import { Request, Response } from 'express';
import Status from '../../types/api';
import { getCategories } from '../categories/categories.model';
import { getRecipes } from './recipes.model';

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;

    try {
        const recipes = await getRecipes(id);
        if (!recipes || recipes.length === 0) {
            // When nothing matches return an empty array
            res.send({ recipes: [] });
            return;
        }


        let result = recipes as Array<Recipe & { category?: Omit<CategoryList, 'recipe_id'>[] }>;

        // Adding category
        const categoryList = await getCategories(id);
        if (categoryList) {
            result = result.map(recipe => {
                const { id } = recipe;
                const category = categoryList.filter(category =>
                    category.recipe_id === id as unknown as Pick<Recipe, 'id'>
                );
                category.forEach(c => delete c.recipe_id);
                recipe.category = category;
                return recipe;
            });
        }

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}