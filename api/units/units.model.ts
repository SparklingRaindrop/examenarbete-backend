import knex from '../../knex/knex';

export async function getUnit(userId: Pick<User, 'id'>, unitId: Pick<Item, 'id'>): Promise<Item | undefined> {
    try {
        return knex<Item>('Item')
            .where('id', unitId)
            .where('user_id', null)
            .orWhere('user_id', userId)
            .select('id', 'name')
            .first();
    } catch (error) {
        console.error(error);
        return;
    }
}