import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('Grocery').del();

    // Inserts seed entries
    await knex('Grocery').insert([
        {
            id: uuid(),
            updated_at: new Date(),
            item_id: 1,
            amount: 1,
            isChecked: false,
        }, {
            id: uuid(),
            updated_at: new Date(),
            item_id: 2,
            amount: 3,
            isChecked: false,
        },
    ]);
}
