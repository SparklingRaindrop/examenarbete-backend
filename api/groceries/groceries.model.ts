import knex from '../../knex/knex';

export async function getGroceries(): Promise<Grocery[] | undefined> {
    try {
        return await knex<Grocery[]>('Grocery')
            .select('Grocery.*', 'Item.id as item_id', 'Item.name as item_name')
            .innerJoin(
                'Item',
                'item_id',
                '=',
                'Item.id'
            );
    } catch (error) {
        console.error(error);
    }
    return;
}

type GroceryResponse = {
    name: Pick<Item, 'name'>
} & Grocery;

export async function getGrocery(id: Pick<Grocery, 'id'>): Promise<GroceryResponse | undefined> {
    try {
        return knex<GroceryResponse>('Grocery')
            .select('Grocery.*', 'Item.name as item_name')
            .innerJoin(
                'Item',
                'Item.id',
                '=',
                'item_id'
            )
            .where('Grocery.id', id)
            .first();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function removeGrocery(id: Pick<Grocery, 'id'>): Promise<void | undefined> {
    try {
        await knex<Grocery[]>('Grocery')
            .where('id', id)
            .del();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function addGrocery(newData: Exclude<Grocery, 'id'>): Promise<void> {
    try {
        await knex<Grocery>('Grocery')
            .insert(newData);
    } catch (error) {
        console.error(error);
    }
    return;
}

interface newData extends Omit<Grocery, 'amount' | 'isChecked' | 'id'> {
    amount?: number,
    isChecked?: boolean,
}

export async function editGrocery(id: Pick<Grocery, 'id'>, newData: newData): Promise<void> {
    const { isChecked, amount, updated_at } = newData;
    try {
        await knex<Grocery>('Grocery')
            .where('id', id)
            .update({
                amount,
                isChecked,
                updated_at: updated_at
            });
    } catch (error) {
        console.error(error);
    }
    return;
}