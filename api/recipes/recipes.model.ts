import knex from '../../knex/knex';

export function getRecipes(userId: Pick<User, 'id'>): Promise<Recipe[]> {
    return knex<Recipe>('Recipe')
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('Recipe.id', 'Recipe.title');
}

export function getRecipesById(userId: Pick<User, 'id'>, recipe_id: Pick<Recipe, 'id'>): Promise<Recipe[]> {
    return knex<Recipe>('Recipe')
        .where('id', recipe_id)
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('Recipe.id', 'Recipe.title');
}