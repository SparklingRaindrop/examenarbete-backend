import knex from '../../knex/knex';

const today = new Date();
const currentMonth = {
    from: new Date(today.getFullYear(), today.getMonth(), 1),
    to: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 59),
};

// range is set to current month by default
export async function getPlans(userId: User['id'], range: { from: Date | null, to: Date | null } = currentMonth): Promise<PlanResponse[]> {
    return knex<Plan>('Plan')
        .leftJoin(
            'Recipe',
            'Plan.recipe_id',
            '=',
            'Recipe.id'
        )
        .where('user_id', userId)
        .whereBetween('date', [
            range.from ? range.from.getTime() : currentMonth.from.getTime(),
            range.to ? range.to.getTime() : currentMonth.to.getTime()
        ])
        .select(
            'id', 'updated_at', 'date', 'type',
            'recipe_id AS recipe_id', 'Recipe.title AS recipe_title',
        )
        .then((result: any) => (
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

export function getPlan(userId: User['id'], planId: Plan['id']): Promise<PlanResponse> {
    return knex<Plan>('Plan')
        .leftJoin(
            'Recipe',
            'Plan.recipe_id',
            '=',
            'Recipe.id'
        )
        .where('user_id', userId)
        .andWhere('id', planId)
        .first()
        .select(
            'id', 'updated_at', 'date', 'type',
            'recipe_id AS recipe_id', 'Recipe.title AS recipe_title',
        )
        .then((result: any) => {
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

export function removePlan(userId: User['id'], planId: Plan['id']): Promise<number> {
    return knex<Plan>('Plan')
        .where('id', planId)
        .andWhere('user_id', userId)
        .del();
}

export async function addPlan(userId: User['id'], newData: Omit<Plan, 'user_id'>): Promise<Omit<Plan, 'user_id'>> {
    return knex<Plan & { user_id: string }>('Plan')
        .insert({
            ...newData,
            user_id: userId,
        })
        .then(() => newData);
}

export function updatePlan(
    userId: User['id'],
    planId: Plan['id'],
    newData: Partial<Pick<Plan, 'date' | 'type' | 'updated_at'> & { recipe_id: Recipe['id'] }>): Promise<void> {
    const { date, type, recipe_id } = newData;
    return knex<Plan>('Plan')
        .where('id', planId)
        .andWhere('user_id', userId)
        .update({ date, type, recipe_id });
}