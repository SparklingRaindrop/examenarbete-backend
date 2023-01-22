import knex from '../../knex/knex';

export type IngredientResponse = Pick<Ingredient, 'id' | 'amount'> & {
    item: ItemResponse,
    amount: Ingredient['amount'];
};

export async function getIngredients(userId: User['id'], recipeId: Recipe['id'] | Recipe['id'][]): Promise<IngredientResponse[]> {
    return knex<Ingredient & Item & Unit>('Ingredient')
        .where(builder => {
            if (Array.isArray(recipeId)) {
                builder.whereIn('Ingredient.recipe_id', recipeId);
            } else {
                builder.where('Ingredient.recipe_id', recipeId);
            }
        })
        .leftJoin(
            'Item',
            'Ingredient.item_id',
            'Item.id'
        )
        .leftJoin(
            'Unit',
            'Item.unit_id',
            'Unit.id'
        )
        .select(
            'Item.id AS item_id', 'Item.name AS item_name',
            'Unit.id AS unit_id', 'Unit.name AS unit_name',
            knex.raw('SUM(Ingredient.amount) AS amount')
        )
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .groupByRaw('Item.id')
        .then((result: Ingredient[]) => (
            result.map((item: any) => {
                const newItem = { ...item };
                for (const key in newItem) {
                    if (!key.includes('_') || key === 'updated_at') continue;

                    const [property, subProperty] = key.split('_');
                    if (property === 'unit') {
                        newItem.item.unit = {
                            ...newItem.item.unit,
                            [subProperty]: newItem[key]
                        };
                    } else {
                        newItem[property] = {
                            ...newItem[property],
                            [subProperty]: newItem[key]
                        };
                    }
                    delete newItem[key];
                }
                return newItem;
            })
        ));
}

export async function addIngredients(newData: Ingredient[]): Promise<Omit<Ingredient, 'user_id'>[]> {
    return knex<Ingredient>('Ingredient')
        .insert(newData)
        .then(() => newData);
}

export function updateIngredient(userId: User['id'], ingredientId: Ingredient['id'], newData: Partial<Ingredient>): Promise<void> {
    return knex<Ingredient>('Ingredient')
        .where('id', ingredientId)
        .andWhere('Ingredient.user_id', userId)
        .update(newData);
}