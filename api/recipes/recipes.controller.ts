import { Request, Response } from 'express';
import Status from '../../types/api';
import { getCategoriesByRecipeId } from '../categories/categories.model';
import { getRecipes } from './recipes.model';

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { title, category, ingredients } = req.body;

    try {
        const recipes = await getRecipes(id);
        if (category) {
            const categories = await getCategoriesByRecipeId(id);
        }
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}