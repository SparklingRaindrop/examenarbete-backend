import knex from '../../knex/knex';

export async function getRecipes(userId: User['id'], keyword?: string): Promise<{ [key: string]: string }[]> {
    return knex<Recipe>('Recipe')
        .andWhere(builder =>
            builder
                .where('Recipe.user_id', userId)
                .orWhere('Recipe.user_id', null)
        )
        .modify(function (queryBuilder) {
            if (keyword) {
                queryBuilder.where('title', 'like', `%${keyword}%`);
            }
        })
        .leftJoin(
            'Ingredient',
            'Recipe.id',
            'Ingredient.recipe_id'
        )
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
            'Recipe.id', 'Recipe.title',
            'Ingredient.amount',
            'Item.name as item_name', 'Item.id as item_id',
            'Unit.id as unit_id', 'Unit.name as unit_name'
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

export function getRecipe(userId: User['id'], recipe_id: Recipe['id']): Promise<Omit<Recipe, 'user_id'>> {
    return knex<Recipe>('Recipe')
        .where('id', recipe_id)
        .andWhere(builder =>
            builder
                .where('Recipe.user_id', userId)
                .orWhere('Recipe.user_id', null)
        )
        .first()
        .select('id', 'title');
}

