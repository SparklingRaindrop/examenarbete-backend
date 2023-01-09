import knex from '../../knex/knex';

export async function getItem(id: Pick<Item, 'id'>): Promise<Item | undefined> {
    try {
        return await knex<Item>('Item')
            .where('id', id)
            .select('Item.*')
            .first();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function getItemByName(name: Pick<Item, 'name'>): Promise<Item | undefined> {
    try {
        return await knex<Item>('Item')
            .where('name', name)
            .select('Item.*')
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

export async function editItem(id: Pick<Item, 'id'>, newName: Pick<Item, 'name'>): Promise<void> {
    try {
        await knex('Item')
            .where({ id })
            .update({
                name: newName
            });
    } catch (error) {
        console.error(error);
    }
    return;
}