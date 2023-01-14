import knex from '../../knex/knex';

export function getItems(userId: User['id']): Promise<Item[]> {
    return knex<Item>('Item')
        .leftJoin(
            'Unit',
            'Item.unit_id',
            '=',
            'Unit.id'
        )
        .where(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .select('Item.id', 'Item.name', 'Unit.name as unit');
}

export function getItem(userId: User['id'], itemId: Item['id']): Promise<Item | undefined> {
    return knex<Item>('Item')
        .leftJoin(
            'Unit',
            'Item.unit_id',
            '=',
            'Unit.id'
        )
        .where('Item.id', itemId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .select('Item.id', 'Item.name', 'Unit.name as unit')
        .first();
}

export async function addItem(user_id: User['id'], newData: Omit<Item, 'user_id'>): Promise<Omit<Item, 'user_id'>> {
    return knex<Item>('Item')
        .insert({ ...newData, user_id })
        .then(() => newData);
}

export function updateItem(userId: User['id'], itemId: Item['id'], newData: Partial<Pick<Item, 'name' | 'unit_id'>>): Promise<void> {
    return knex<Item>('Item')
        .where('id', itemId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .update(newData);
}

export async function isDuplicatedItemName(userId: User['id'], name: Item['name']): Promise<boolean> {
    return knex<Item>('Item')
        .where('name', name)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .then((result) => result.length !== 0);
}

export async function hasItemWithUnitId(userId: User['id'], unitId: Unit['id']): Promise<boolean> {
    return knex<Item>('Item')
        .where('unit_id', unitId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .then((result) => result.length !== 0);
}

