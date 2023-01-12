import knex from '../../knex/knex';

export function getIngredients(userId: User['id'], recipeId: Recipe['id']): Promise<Ingredient[]> {
    return knex<Ingredient & Item & Unit>('Ingredient')
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
        .select('amount', 'Item.name', 'Item.id as item_id', 'Unit.name as unit')
        .where('Ingredient.recipe_id', recipeId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        );
}