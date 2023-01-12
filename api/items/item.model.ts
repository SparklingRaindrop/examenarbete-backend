import knex from '../../knex/knex';

export function getItems(userId: User['id']): Promise<Item[]> {
    return knex<Item>('Item')
        .leftJoin(
            'Unit',
            'Item.unit_id',
            '=',
            'Unit.id'
        )
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('Item.id', 'Item.name', 'Unit.name as unit');
}

export function getItem(userId: User['id'], itemId: Item['id']): Promise<Item | undefined> {
    return knex<Item>('Item')
        .where('id', itemId)
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('id', 'name')
        .first();
}

// TODO: delete
export function getItemByName(name: User['id']): Promise<Item | undefined> {
    return knex<Item>('Item')
        .where('name', name)
        .select('id', 'name')
        .first();
}

export async function addItem(newData: Item): Promise<Item> {
    return knex('Item')
        .insert(newData)
        .then(() => newData);
}

export function editItem(userId: User['id'], itemId: Item['id'], newName: Item['name']): Promise<void> {
    return knex('Item')
        .where('id', itemId)
        .where('user_id', null)
        .orWhere('user_id', userId)
        .update({
            name: newName
        });
}