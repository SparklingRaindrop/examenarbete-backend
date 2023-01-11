import knex from '../../knex/knex';

export function getItems(userId: Pick<User, 'id'>): Promise<Item[] | undefined> {
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

export async function getItem(userId: Pick<User, 'id'>, itemId: Pick<Item, 'id'>): Promise<Item | undefined> {
    try {
        return knex<Item>('Item')
            .where('id', itemId)
            .where('user_id', null)
            .orWhere('user_id', userId)
            .select('id', 'name')
            .first();
    } catch (error) {
        console.error(error);
        return;
    }
}

// TODO: delete
export async function getItemByName(name: Pick<Item, 'name'>): Promise<Item | undefined> {
    try {
        return await knex<Item>('Item')
            .where('name', name)
            .select('id', 'name')
            .first();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function addItem(newData: Item): Promise<Item | undefined> {
    try {
        await knex('Item')
            .insert(newData);
        return newData;
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function editItem(userId: Pick<Item, 'id'>, itemId: Pick<Item, 'id'>, newName: Pick<Item, 'name'>): Promise<void> {
    try {
        await knex('Item')
            .where('id', itemId)
            .where('user_id', null)
            .orWhere('user_id', userId)
            .update({
                name: newName
            });
    } catch (error) {
        console.error(error);
    }
    return;
}