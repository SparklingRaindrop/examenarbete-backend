import knex from '../knex/knex';

export interface Session {
    user_id: User['id'];
    refresh_id: string;
    created_at: Date;
}
