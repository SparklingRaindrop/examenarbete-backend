import knex from '../knex/knex';

export async function isRemovedToken(userId: User['id']): Promise<boolean> {
    return knex<Recipe>('Service')
        .where('user_id', userId)
        .then((result) => result.length !== 0);
}