import knex from '../../knex/knex';
import { Grocery, GroceryItem } from '../../types/grocery';

interface newData {
    item_id: string,
    updated_at: Date,
    amount?: number,
    isChecked?: boolean,
}

export async function getAll(): Promise<Grocery | undefined> {
    try {
        return await knex<Grocery>('Item')
            .select('Item.*', 'Grocery.*')
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

export async function getById(item_id: string): Promise<GroceryItem | undefined> {
    try {
        return knex<GroceryItem>('Grocery')
            .select('*')
            .where('item_id', item_id)
            .first();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function remove(item_id: string): Promise<void | undefined> {
    try {
        await knex<Grocery>('Grocery')
            .where('item_id', item_id)
            .del();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function add(newData: GroceryItem): Promise<void> {
    try {
        await knex<GroceryItem>('Grocery')
            .insert(newData);
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function edit(newData: newData): Promise<void> {
    const { isChecked, amount, item_id, updated_at } = newData;
    try {
        await knex<GroceryItem>('Grocery')
            .where('item_id', item_id)
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