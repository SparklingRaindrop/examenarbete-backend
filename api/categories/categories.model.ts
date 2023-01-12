import knex from '../../knex/knex';

export function getCategories(userId: User['id']): Promise<CategoryList[] | undefined> {
    return knex<Category[]>('Category')
        .innerJoin(
            'Category_list',
            'id',
            '=',
            'Category_list.category_id',
        )
        .where('user_id', null)
        .orWhere('user_id', userId)
        .select('name', 'id', 'recipe_id');
}