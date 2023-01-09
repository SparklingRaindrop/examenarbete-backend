import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('User').del();

    // Inserts seed entries
    await knex('User').insert([
        {
            id: uuid(),
            username: 'test',
            email: 'test@example.com',
        },
    ]);
}
