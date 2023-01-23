import knex from '../knex/knex';

export interface Session {
    user_id: User['id'];
    refresh_id: string;
    created_at: Date;
}

export async function createSession(data: Session): Promise<Pick<Session, 'refresh_id'>> {
    return knex<Session>('Session')
        .insert(data)
        .then(() => ({
            refresh_id: data.refresh_id
        }));
}