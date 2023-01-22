import knex from '../../knex/knex';

export async function getGroceries(userId: User['id']): Promise<Grocery[]> {
    return knex<Grocery>('Grocery')
        .leftJoin(
            'Item',
            'item_id',
            '=',
            'Item.id'
        )
        .leftJoin(
            'Unit',
            'unit_id',
            '=',
            'Unit.id'
        )
        .select([
            'Grocery.id', 'updated_at', 'amount', 'isChecked',
            'Item.id as item_id',
            'Item.name as item_name',
            'Unit.id as unit_id',
            'Unit.name as unit_name'
        ])
        .where('Grocery.user_id', userId)
        .then((result) => (
            result.map(item => {
                const newItem = { ...item };
                for (const key in newItem) {
                    if (!key.includes('_') || key === 'updated_at') continue;

                    const [property, subProperty] = key.split('_');
                    newItem[property] = {
                        ...newItem[property],
                        [subProperty]: newItem[key]
                    };
                    delete newItem[key];
                }
                return newItem;
            })
        ));
}

type GroceryResponse = {
    name: Pick<Item, 'name'>
} & Grocery;

export function getGrocery(userId: User['id'], groceryId: Grocery['id']): Promise<GroceryResponse> {
    return knex<GroceryResponse>('Grocery')
        .select('Grocery.*', 'Item.name as item_name')
        .innerJoin(
            'Item',
            'Item.id',
            '=',
            'item_id'
        )
        .where('Grocery.id', groceryId)
        .andWhere('Grocery.user_id', userId)
        .first();
}

export function removeGrocery(userId: User['id'], groceryId: Grocery['id']): Promise<number> {
    return knex<Grocery>('Grocery')
        .where('id', groceryId)
        .andWhere('user_id', userId)
        .del();
}

export async function addGrocery(user_id: User['id'], newData: Omit<Grocery, 'user_id'> | Omit<Grocery, 'user_id'>[]): Promise<Omit<Grocery, 'user_id'> | Omit<Grocery, 'user_id'>[]> {
    if (Array.isArray(newData)) {
        const data = (newData as Grocery[]).map(item => ({
            ...item,
            user_id
        }));
        return knex<Grocery>('Grocery')
            .insert(data)
            .then(() => newData);
    } else {
        return knex<Grocery>('Grocery')
            .insert({ ...newData, user_id })
            .then(() => newData);
    }
}

export interface newData extends Omit<Grocery, 'amount' | 'isChecked' | 'id' | 'user_id'> {
    amount?: number,
    isChecked?: boolean,
}

export function updateGrocery(groceryId: Grocery['id'], newData: newData): Promise<void> {
    const { isChecked, amount, updated_at } = newData;
    return knex<Grocery>('Grocery')
        .where('id', groceryId)
        .update({
            amount,
            isChecked,
            updated_at: updated_at
        });
}