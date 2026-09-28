import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Add is_verified and claimed_by to restaurants
  await knex.schema.alterTable('restaurants', (table) => {
    table.boolean('is_verified').defaultTo(false);
    table.uuid('claimed_by').references('id').inTable('users').onDelete('SET NULL');
  });

  // 2. Add restaurant_id to posts
  await knex.schema.alterTable('posts', (table) => {
    table.uuid('restaurant_id').references('id').inTable('restaurants').onDelete('CASCADE');
  });

  // 3. Create post_dishes table
  await knex.schema.createTable('post_dishes', (table) => {
    table.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE');
    table.uuid('dish_id').notNullable().references('id').inTable('dishes').onDelete('CASCADE');
    table.primary(['post_id', 'dish_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('post_dishes');
  
  await knex.schema.alterTable('posts', (table) => {
    table.dropColumn('restaurant_id');
  });

  await knex.schema.alterTable('restaurants', (table) => {
    table.dropColumn('is_verified');
    table.dropColumn('claimed_by');
  });
}
