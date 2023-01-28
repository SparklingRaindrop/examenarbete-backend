import knex from '../knex/knex';

type Service = { id: number, created_at: Date, user_id: string };

export async function isDeactivatedToken(userId: User['id']): Promise<boolean> {
    return knex<Service>('Service')
        .where('user_id', userId)
        .then((result) => result.length !== 0);
}

export async function activateUserId(userId: User['id']): Promise<void> {
    knex<Service>('Service')
        .where('user_id', userId)
        .then(async (result) => {
            if (result.length === 0) {
                return;
            } else {
                await knex<Service>('Service')
                    .where('user_id', userId)
                    .del();
                return;
            }
        });
}

export function deactivateToken(data: { user_id: User['id'], created_at: Date }): Promise<void> {
    return knex<Service>('Service')
        .insert(data);
}