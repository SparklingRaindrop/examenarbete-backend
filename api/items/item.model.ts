import knex from '../../knex/knex';

export async function getItems(userId: User['id'], keyword?: string): Promise<ItemResponse[]> {
    return knex<Item>('Item')
        .leftJoin(
            'Unit',
            'Item.unit_id',
            '=',
            'Unit.id'
        )
        .where(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .select(
            'Item.id', 'Item.name',
            'Unit.id as unit_id', 'Unit.name as unit_name'
        )
        .modify(function (queryBuilder) {
            if (keyword) {
                queryBuilder.andWhere('Item.name', 'like', `%${keyword}%`);
            }
        })
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

export async function getItem(userId: User['id'], itemId: Item['id']): Promise<ItemResponse | undefined> {
    return knex<Item>('Item')
        .leftJoin(
            'Unit',
            'Item.unit_id',
            '=',
            'Unit.id'
        )
        .where('Item.id', itemId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .select(
            'Item.id', 'Item.name',
            'Unit.name as unit_id', 'Unit.name as unit_name'
        )
        .first()
        .then((result) => {
            const newItem = { ...result };
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
        });
}

export async function addItem(
    user_id: User['id'],
    newData: Omit<Item, 'user_id'>
): Promise<Omit<Item, 'user_id'>> {
    return knex<Item>('Item')
        .insert({ ...newData, user_id })
        .then(() => newData);
}

export function updateItem(userId: User['id'], itemId: Item['id'], newData: Partial<Pick<Item, 'name' | 'unit_id'>>): Promise<void> {
    return knex<Item>('Item')
        .where('id', itemId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .update(newData);
}

export async function isDuplicatedItemName(
    userId: User['id'],
    { name, item_id }: { name: Item['name'], item_id?: Item['id'] }
): Promise<boolean> {
    return knex<Item>('Item')
        .where('name', name)
        .where(builder => {
            if (item_id) {
                builder.whereNot('id', item_id);
            }
        })
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
        )
        .then((result) => result.length !== 0);
}

export async function hasItemWithUnitId(userId: User['id'], unitId: Unit['id']): Promise<boolean> {
    return knex<Item>('Item')
        .where('unit_id', unitId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .then((result) => result.length !== 0);
}

export async function isAvailableItem(userId: User['id'], itemId: Item['id']): Promise<boolean> {
    return knex<Item>('Item')
        .where('id', itemId)
        .andWhere(builder =>
            builder
                .where('Item.user_id', userId)
                .orWhere('Item.user_id', null)
        )
        .then((result) => result.length !== 0);
}

export async function isDefaultItem(itemId: Item['id']): Promise<boolean> {
    return knex<Item>('Item')
        .where('id', itemId)
        .whereNull('user_id')
        .select('*')
        .then(result => result.length > 0);
}