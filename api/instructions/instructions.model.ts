import knex from '../../knex/knex';
import { v4 as uuid } from 'uuid';

export function getInstructions(userId: User['id'], recipeId: Recipe['id']): Promise<InstructionResponse[]> {
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

export async function addInstruction(user_id: User['id'], newData: Omit<Instruction, 'user_id'>[]): Promise<Omit<Instruction, 'user_id'>[]> {
    const dataWithUserId = (newData as Instruction[]).map(item => {
        item.user_id = user_id;
        return item;
    });

    return knex<Instruction>('Instruction')
        .insert(dataWithUserId)
        .then(() => newData);
}

export async function updateInstruction(
    userId: User['id'],
    recipeId: Recipe['id'],
    newData: Pick<Instruction, 'instruction' | 'step_no'>
): Promise<void> {
    return knex<Instruction>('Instruction')
        .where('recipe_id', recipeId)
        .andWhere('Instruction.user_id', userId)
        .select()
        .then((result) => {
            if (result.length > 0) {
                knex<Instruction>('Instruction')
                    .where('recipe_id', recipeId)
                    .update(newData);
            } else {
                const newInstruction = {
                    id: uuid(),
                    step_no: newData.step_no,
                    instruction: newData.instruction,
                    recipe_id: recipeId,
                };
                addInstruction(userId, [newInstruction]);
            }
        });
}