import knex from '../../knex/knex';

export function getRecipes(userId: Pick<User, 'id'>): Promise<Recipe[]> {
    return knex<Recipe>('Recipe')
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('Recipe.id', 'Recipe.title');
}

export function getRecipe(userId: Pick<User, 'id'>, recipe_id: Pick<Recipe, 'id'>): Promise<Omit<Recipe, 'user_id'>> {
    return knex<Recipe>('Recipe')
        .where('user_id', null)
        .orWhere('user_id', userId)
        .andWhere('id', recipe_id)
        .first()
        .select('Recipe.id', 'Recipe.title');
}

