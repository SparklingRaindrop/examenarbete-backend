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
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
        })
        .createTable('Grocery', function (table) {
            table.string('id').notNullable().primary();
            table.timestamp('updated_at');
            table.float('amount').notNullable();
            table.boolean('isChecked').notNullable();
            table.string('item_id').notNullable();
            table.string('user_id').notNullable();
            table.foreign('item_id').references('Item.id');
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
        })
        .createTable('Unit', function (table) {
            table.string('id').notNullable().primary();
            table.string('name');
            table.string('user_id');
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
        })
        .createTable('Recipe', function (table) {
            table.string('id').notNullable().primary();
            table.string('title').notNullable();
            table.string('user_id');
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
        })
        .createTable('Category', function (table) {
            table.string('id').notNullable().primary();
            table.string('name').notNullable().unique();
            table.string('user_id');
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
        })
        .createTable('Category_list', function (table) {
            table.string('category_id');
            table.string('recipe_id');
            table.foreign('recipe_id').references('Recipe.id');
            table.foreign('category_id').references('Category.id');
        })
        .createTable('Plan', function (table) {
            table.string('id').notNullable().primary();
            table.timestamp('updated_at').notNullable();
            table.timestamp('date').notNullable();
            table.string('type').notNullable();
            table.string('recipe_id');
            table.string('user_id');
            table.foreign('recipe_id').references('Recipe.id');
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
        })
        .createTable('Ingredient', function (table) {
            table.string('id').notNullable().primary();
            table.float('amount');
            table.string('item_id');
            table.string('recipe_id');
            table.foreign('item_id').references('Item.id');
            table.foreign('recipe_id').references('Recipe.id');
        })
        .createTable('Instruction', function (table) {
            table.string('id').notNullable().primary();
            table.string('user_id');
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
        })
        .createTable('Stock', function (table) {
            table.string('id').notNullable().primary();
            table.string('item_id').notNullable().unique();
            table.string('user_id').notNullable();
            table.float('amount');
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
            table.foreign('item_id').references('Item.id').onDelete('CASCADE');
        })
        .createTable('Service', function (table) {
            table.increments('id').primary();
            table.timestamp('created_at');
            table.string('user_id').notNullable();
            table.foreign('user_id').references('User.id').onDelete('CASCADE');
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
        .dropTable('Category_list')
        .dropTable('Instruction')
        .dropTable('Ingredient')
        .dropTable('Service');
}

