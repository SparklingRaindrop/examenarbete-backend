import knex from '../../knex/knex';

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
        .where('Stock.user_id', userId)
        .select(
            'Stock.id',
            'Stock.amount',
            'Item.id as item_id',
            'Item.name as item_name',
            'Unit.id as unit_id',
            'Unit.name as unit_name',
        )
        .then((result) => (
            result.map((item) => {
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

type Property = 'item' | 'unit';
type SubProperty = 'id' | 'name';
type TempDate = Omit<Stock, 'item_id' | 'user_id'> &
    Partial<Pick<Stock, 'item_id' | 'user_id'>> & {
        item: Pick<Item, 'id' | 'name'>
    } & {
        unit: Pick<Unit, 'id' | 'name'>
    };
type TargetKey = 'user_id' | 'item_id';

async function getStock(userId: User['id'], stockId: Stock['id']): Promise<StockResponse | undefined> {
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
        .where('Stock.user_id', userId)
        .andWhere('Stock.id', stockId)
        .select(
            'Stock.id',
            'Stock.amount',
            'Unit.id as unit_id',
            'Unit.name as unit_name',
            'Item.id as item_id',
            'Item.name as item_name',
        )
        .first()
        .then((result) => {
            if (!result) return;
            const newItem: TempDate = { ...result };

            for (const key in newItem) {
                if (!key.includes('_')) continue;

                const [property, subProperty] = key.split('_') as [Property, SubProperty];
                newItem[property] = {
                    ...newItem[property],
                    [subProperty]: newItem[key as keyof TempDate]
                };
                delete newItem[key as TargetKey];
            }
            return newItem;
        });
}

export function removeStock(userId: User['id'], stockId: Stock['id']): Promise<number> {
    return knex<Stock>('Stock')
        .where('id', stockId)
        .andWhere('user_id', userId)
        .del();
}

export async function addStock(userId: User['id'], newData: Omit<Stock, 'user_id'>): Promise<Omit<Stock, 'user_id'>> {
    return knex<Stock>('Stock')
        .insert({
            ...newData,
            user_id: userId,
        })
        .then(() => newData);
}

export async function updateStock(
    userId: User['id'],
    stockId: Stock['id'],
    newData: Partial<Pick<Stock, 'amount' | 'item_id'>>
): Promise<StockResponse> {
    return knex<Stock>('Stock')
        .where('id', stockId)
        .andWhere('user_id', userId)
        .update(newData)
        .then(async () => {
            const result = await getStock(userId, stockId);
            if (!result) throw new Error('Couldn\'t update');
            return result;
        });
}