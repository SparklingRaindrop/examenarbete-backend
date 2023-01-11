import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema
        .createTable('User', function (table) {
            table.string('id').notNullable().primary();
            table.string('username').notNullable().unique();
            table.string('email').notNullable().unique();
            table.string('password').notNullable();
        })
        .createTable('Item', function (table) {
            table.string('id').notNullable().primary();
            table.string('name').notNullable().unique();
            table.string('user_id');
            table.string('unit_id');
            table.foreign('unit_id').references('Unit.id');
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
        })
        .createTable('Unit', function (table) {
            table.string('id').notNullable().primary();
            table.string('name').unique();
        })
        .createTable('Recipe', function (table) {
            table.string('id').notNullable().primary();
            table.string('title').notNullable();
            table.string('category_id');
            table.string('user_id');
            table.foreign('category_id').references('Category.id');
            table.foreign('user_id').references('User.id');
        })
        .createTable('Category', function (table) {
            table.string('id').notNullable().primary();
            table.string('name').notNullable().unique();
            table.string('user_id');
            table.foreign('user_id').references('User.id');
        })
        .createTable('Stock', function (table) {
            table.string('id').notNullable().primary();
            table.string('user_id');
            table.foreign('user_id').references('User.id');
        })
        .createTable('Plan', function (table) {
            table.string('id').notNullable().primary();
            table.string('user_id');
            table.foreign('user_id').references('User.id');
        })
        .createTable('Instruction', function (table) {
            table.string('id').notNullable().primary();
            table.string('user_id');
            table.foreign('user_id').references('User.id');
        })
        .createTable('Ingredient', function (table) {
            table.string('id').notNullable().primary();
            table.string('user_id');
            table.foreign('user_id').references('User.id');
        });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema
        .dropTable('User')
        .dropTable('Item')
        .dropTable('Grocery')
        .dropTable('Unit')
        .dropTable('Stock')
        .dropTable('Plan')
        .dropTable('Recipe')
        .dropTable('Category')
        .dropTable('Instruction')
        .dropTable('Ingredient');
}

