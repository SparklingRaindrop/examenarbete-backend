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

export async function addItem(newData: Omit<Item, 'user_id'>): Promise<Omit<Item, 'user_id'>> {
    return knex<Item>('Item')
        .insert(newData)
        .then(() => newData);
}

export function editItem(userId: User['id'], itemId: Item['id'], newData: Partial<Pick<Item, 'name' | 'unit_id'>>): Promise<void> {
    return knex<Item>('Item')
        .where('id', itemId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .update(newData);
}

export async function isDuplicatedName(userId: User['id'], name: string): Promise<boolean> {
    return knex<Item>('Item')
        .where('name', name)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .then((result) => result.length !== 0);
}