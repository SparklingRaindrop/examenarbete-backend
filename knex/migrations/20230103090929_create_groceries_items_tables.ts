import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .createTable('User', function (table) {
            table.string('id').notNullable().primary();
            table.string('username').notNullable();
            table.string('email').notNullable();
            table.string('password').notNullable();
        })
        .createTable('Item', function (table) {
            table.string('id').notNullable().primary();
            table.string('name').notNullable();
            table.string('user_id');
            table.foreign('user_id').references('User.id');
        })
        .createTable('Grocery', function (table) {
            table.string('id').notNullable().primary();
            table.timestamp('updated_at');
            table.float('amount').notNullable();
            table.boolean('isChecked').notNullable();
            table.string('item_id').notNullable();
            table.string('user_id').notNullable();
            table.foreign('item_id').references('Item.id');
            table.foreign('user_id').references('User.id');
        });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema
        .dropTable('User')
        .dropTable('Item')
        .dropTable('Grocery');
}
