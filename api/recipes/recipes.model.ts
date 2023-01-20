import knex from '../../knex/knex';

export async function getRecipes(userId: User['id'], keyword?: string): Promise<Omit<Recipe, 'user_id'>[]> {
    return knex<Recipe>('Recipe')
        .andWhere(builder =>
            builder
                .where('Recipe.user_id', userId)
                .orWhere('Recipe.user_id', null)
        )
        .modify(function (queryBuilder) {
            if (keyword) {
                queryBuilder.where('title', 'like', `%${keyword}%`);
            }
        })
        .select('id', 'title');
}

export function getRecipe(userId: User['id'], recipe_id: Recipe['id']): Promise<Omit<Recipe, 'user_id'>> {
    return knex<Recipe>('Recipe')
        .where('id', recipe_id)
        .andWhere(builder =>
            builder
                .where('Recipe.user_id', userId)
                .orWhere('Recipe.user_id', null)
        )
        .first()
        .select('id', 'title');
}

export function removeRecipe(userId: User['id'], recipeId: Recipe['id']): Promise<number> {
    return knex<Recipe>('Recipe')
        .where('id', recipeId)
        .andWhere('user_id', userId)
        .del();
}

export async function addRecipe(userId: User['id'], newData: Omit<Recipe, 'user_id'>): Promise<Omit<Recipe, 'user_id'>> {
    return knex<Recipe>('Recipe')
        .insert({
            ...newData,
            user_id: userId
        })
        .then(() => newData);
}

export function updateRecipe(userId: User['id'], recipeId: Recipe['id'], newData: Partial<Recipe>): Promise<void> {
    return knex<Recipe>('Recipe')
        .where('id', recipeId)
        .andWhere('Recipe.user_id', userId)
        .update(newData);
}