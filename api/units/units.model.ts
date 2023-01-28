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

export function removeUnit(userId: User['id'], unitsId: Unit['id']): Promise<number> {
    return knex<Unit>('Unit')
        .where('id', unitsId)
        .andWhere('user_id', userId)
        .del();
}

export async function addUnit(user_id: User['id'], newData: Omit<Unit, 'user_id'>): Promise<Omit<Unit, 'user_id'>> {
    return knex<Unit>('Unit')
        .insert({ ...newData, user_id })
        .then(() => newData);
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

export async function isDuplicatedUnit(userId: User['id'], name: Unit['name']): Promise<boolean> {
    return knex<Unit>('Unit')
        .where('name', name)
        .andWhere(builder =>
            builder
                .where('user_id', userId)
                .orWhere('user_id', null)
        )
        .then((result) => result.length !== 0);
}