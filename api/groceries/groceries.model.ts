import knex from '../../knex/knex';
import { Grocery, GroceryItem } from '../../types/grocery';

interface newData {
    itemId: string,
    amount: number
};

export async function getAll(): Promise<Grocery | undefined> {
    try {
        return await knex<Grocery>('Item')
            .select('Item.*', 'Grocery.amount')
            .innerJoin(
                'Grocery',
                'item_id',
                '=',
                'Item.id'
            )
            .from('Item');
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function getById(itemId: string): Promise<GroceryItem | undefined> {
    try {
        return knex<GroceryItem>('Grocery')
            .select('*')
            .where('item_id', itemId)
            .first();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function remove(itemId: string): Promise<void | undefined> {
    try {
        await knex<Grocery>('Grocery')
            .where('item_id', itemId)
            .del();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function add(newData: newData): Promise<void> {
    const data: GroceryItem = {
        item_id: newData.itemId,
        amount: newData.amount,
        updated_at: new Date()
    };

    try {
        await knex<GroceryItem>('Grocery')
            .insert(data);
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function edit(newData: newData): Promise<void> {
    try {
        await knex<GroceryItem>('Grocery')
            .where('item_id', newData.itemId)
            .update({ amount: newData.amount });
    } catch (error) {
        console.error(error);
    }
    return;
}