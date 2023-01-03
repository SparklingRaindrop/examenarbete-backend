import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('grocery').del();

    // Inserts seed entries
    await knex('grocery').insert([
        {
            updated_at: new Date(),
            item_id: 1,
            amount: 1,
            isChecked: false,
        }, {
            updated_at: new Date(),
            item_id: 2,
            amount: 3,
            isChecked: false,
        },
    ]);
}
