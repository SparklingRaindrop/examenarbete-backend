import knex from '../../knex/knex';

const today = new Date();
const currentMonth = {
    from: new Date(today.getFullYear(), today.getMonth(), 1),
    to: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 59),
};

type PlanDbData = Plan & { recipe_id?: Pick<Recipe, 'id'> };
// range is set to current month by default
export function getPlans(userId: Pick<User, 'id'>, range: { from: Date, to: Date } = currentMonth): Promise<PlanDbData[]> {
    return knex<PlanDbData>('Plan')
        .where('user_id', userId)
        .whereBetween('date', [range.from, range.to])
        .select('id', 'updated_at', 'date', 'type', 'recipe_id');
}

export function getPlan(userId: Pick<User, 'id'>, planId: Pick<Plan, 'id'>): Promise<PlanDbData> {
    return knex<PlanDbData>('Plan')
        .where('user_id', userId)
        .andWhere('id', planId)
        .first()
        .select('id', 'updated_at', 'date', 'type', 'recipe_id');
}

export function removePlan(userId: Pick<User, 'id'>, targetId: Pick<Plan, 'id'>): Promise<number> {
    return knex<Plan>('Plan')
        .where('id', targetId)
        .andWhere('user_id', userId)
        .del();
}