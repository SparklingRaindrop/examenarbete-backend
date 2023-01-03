import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('grocery').del();

    // Inserts seed entries
    await knex('grocery').insert([
        { updated_at: Date.now(), item_id: 1 },
        { updated_at: Date.now(), item_id: 2 },
    ]);
};
