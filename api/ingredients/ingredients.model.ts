import knex from '../../knex/knex';

export async function getIngredients(userId: User['id'], recipeId: Recipe['id']): Promise<Ingredient[]> {
    return knex<Ingredient & Item & Unit>('Ingredient')
        .where('Ingredient.recipe_id', recipeId)
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
            'Ingredient.amount',
            'Item.name as item_name', 'Item.id as item_id',
            'Unit.id as unit_id', 'Unit.name as unit_name'
        )
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .then((result) => (
            result.map((item: any) => {
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