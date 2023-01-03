import knex from '../../knex/knex';

export async function getAll(): Promise<Item[] | undefined> {
    try {
        return await knex<Item>('Item')
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