import knex from '../../knex/knex';

export function getUnits(userId: User['id']): Promise<Unit[]> {
    return knex<Unit>('Unit')
        .andWhere(builder =>
            builder
                .where('Unit.user_id', userId)
                .orWhere('Unit.user_id', null)
        )
        .select('id', 'name');
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