import knex from '../../knex/knex';

export function getInstructions(userId: User['id'], recipeId: Recipe['id']): Promise<Omit<Instruction, 'user_id' | 'recipe_id'>[]> {
    return knex<Instruction>('Instruction')
        .where(
            'recipe_id',
            '=',
            recipeId
        )
        .andWhere(
            'user_id',
            '=',
            userId
        )
        .select('id', 'instruction', 'step_no')
        .orderBy('step_no', 'asc');
}