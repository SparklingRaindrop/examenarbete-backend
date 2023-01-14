import knex from '../../knex/knex';

export type StockResponse = Pick<Stock, 'id' | 'amount'> & {
    item: Pick<Item, 'id' | 'name'>
} & {
    unit: Pick<Unit, 'id' | 'name'>
}

export async function getStocks(userId: User['id']): Promise<StockResponse[]> {
    return knex<Stock>('Stock')
        .leftJoin(
            'Item',
            'Stock.item_id',
            '=',
            'Item.id'
        )
        .leftJoin(
            'Unit',
            'Item.unit_id',
            '=',
            'Unit.id'
        )
        .andWhere(builder =>
            builder
                .where('Stock.user_id', userId)
                .orWhere('Stock.user_id', null)
        )
        .select(
            'Stock.id',
            'Stock.amount',
            'Unit.id as unit_id',
            'Unit.name as unit_name',
            'Item.id as item_id',
            'Item.name as item_name',
        )
        .then((result) => {
            return result.map(item => {
                const newItem = { ...item };
                for (const key in newItem) {
                    if (!key.includes('_')) continue;

                    const [property, subProperty] = key.split('_');
                    newItem[property] = {
                        ...newItem[property],
                        [subProperty]: newItem[key]
                    };
                    delete newItem.key;
                }
                return newItem;
            });
        });
}