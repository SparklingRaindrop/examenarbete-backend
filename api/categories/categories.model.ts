import knex from '../../knex/knex';

export function getCategories(userId: Pick<User, 'id'>): Promise<Category[] | undefined> {
    return knex<Category[]>('Recipe')
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('Recipe.id', 'Recipe.title');
}

export function getCategoriesByRecipeId(recipeId: Pick<Recipe, 'id'>): Promise<Pick<Recipe, 'id'>[] | undefined> {
    return knex<Pick<Recipe, 'id'>[]>('Category_list')
        .where('recipe_id', recipeId)
        .select('Recipe.id', 'Recipe.title');
}