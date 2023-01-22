import knex from '../knex/knex';

export interface Session {
    user_id: User['id'];
    session_id: string;
    created_at: Date;
}

export async function createSession(data: Session): Promise<Pick<Session, 'session_id'>> {
    return knex<Session>('Session')
        .insert(data)
        .then(() => ({
            session_id: data.session_id
        }));
}