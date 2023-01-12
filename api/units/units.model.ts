import knex from '../../knex/knex';

export async function getUnit(userId: User['id'], unitId: Unit['id']): Promise<Unit | undefined> {
    try {
        return knex<Item>('Item')
            .where('id', unitId)
            .andWhere(builder =>
                builder
                    .where('Item.user_id', userId)
                    .orWhere('Item.user_id', null)
            )
            .select('id', 'name')
            .first();
    } catch (error) {
        console.error(error);
        return;
    }
}

export async function isAvailableUnit(userId: User['id'], unitId: Unit['id']): Promise<boolean> {
    return knex<Unit>('Unit')
        .where('id', unitId)
        .andWhere(builder =>
            builder
                .where('user_id', userId)
                .orWhere('user_id', null)
        )
        .then((result) => result.length !== 0);
}