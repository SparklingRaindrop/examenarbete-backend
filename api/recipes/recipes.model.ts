import knex from '../../knex/knex';

export function getRecipes(userId: Pick<User, 'id'>): Promise<Recipe | undefined> {
    return knex<Recipe>('Recipe')
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('Recipe.id', 'Recipe.title');
}