import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('Item').del();

    // Inserts seed entries
    await knex('Item').insert([
        { id: 1, name: 'tomatoes', user_id: 'sds' },
        { id: 2, name: 'onions' },
        { id: 3, name: 'spaghetti' }
    ]);
}
