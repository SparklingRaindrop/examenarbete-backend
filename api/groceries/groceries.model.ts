import knex from '../../knex/knex';

const columns = ['Grocery.id', 'item_id', 'updated_at', 'amount', 'isChecked'];

export function getGroceries(id: Pick<User, 'id'>): Promise<Grocery[]> {
    return knex<Grocery[]>('Grocery')
        .select([...columns, 'Item.id as item_id', 'Item.name as item_name'])
        .innerJoin(
            'Item',
            'item_id',
            '=',
            'Item.id'
        )
        .where('Grocery.user_id', id);
}

type GroceryResponse = {
    name: Pick<Item, 'name'>
} & Grocery;

export function getGrocery(userId: Pick<User, 'id'>, id: Pick<Grocery, 'id'>): Promise<GroceryResponse> {
    return knex<GroceryResponse>('Grocery')
        .select('Grocery.*', 'Item.name as item_name')
        .innerJoin(
            'Item',
            'Item.id',
            '=',
            'item_id'
        )
        .where('Grocery.id', id)
        .where('Grocery.user_id', userId)
        .first();
}

export function removeGrocery(userId: Pick<User, 'id'>, targetId: Pick<Grocery, 'id'>): Promise<number> {
    return knex<Grocery[]>('Grocery')
        .where('id', targetId)
        .where('user_id', userId)
        .del();
}

export function addGrocery(newData: Exclude<Grocery, 'id'>): Promise<void> {
    return knex<Grocery>('Grocery')
        .insert(newData);
}

interface newData extends Omit<Grocery, 'amount' | 'isChecked' | 'id'> {
    amount?: number,
    isChecked?: boolean,
}

export function editGrocery(id: Pick<Grocery, 'id'>, newData: newData): Promise<void> {
    const { isChecked, amount, updated_at } = newData;
    return knex<Grocery>('Grocery')
        .where('id', id)
        .update({
            amount,
            isChecked,
            updated_at: updated_at
        });
}