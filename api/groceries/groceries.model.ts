import knex from '../../knex/knex';
import { Grocery, GroceryItem } from '../../types/grocery';

export async function getAll(): Promise<Item[] | undefined> {
    try {
        return await knex<Grocery>('Item')
            .select('Item.*')
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

export async function remove(itemId: string): Promise<Item[] | undefined> {
    try {
        await knex<Grocery>('Grocery')
            .where('item_id', itemId)
            .del();
    } catch (error) {
        console.error(error);
    }
    return;
}

export async function add(itemId: string): Promise<void> {
    const newData: GroceryItem = {
        item_id: itemId,
        updated_at: new Date()
    };

    try {
        await knex<GroceryItem>('Grocery')
            .insert(newData);
    } catch (error) {
        console.error(error);
    }
    return;
}