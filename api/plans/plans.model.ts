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
