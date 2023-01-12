import knex from '../../knex/knex';

export function getRecipes(userId: User['id']): Promise<Omit<Recipe, 'user_id'>[]> {
    return knex<Recipe>('Recipe')
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('id', 'title');
}

export function getRecipe(userId: User['id'], recipe_id: Recipe['id']): Promise<Omit<Recipe, 'user_id'>> {
    return knex<Recipe>('Recipe')
        .where('user_id', null)
        .orWhere('user_id', userId)
        .andWhere('id', recipe_id)
        .first()
        .select('id', 'title');
}

