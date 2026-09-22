import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Add saves_count column to posts
  await knex.schema.alterTable('posts', (table) => {
    table.integer('saves_count').defaultTo(0);
  });

  // 2. Create saved_posts table
  await knex.schema.createTable('saved_posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Ensure a user can only save a post once
    table.unique(['post_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('saved_posts');
  
  await knex.schema.alterTable('posts', (table) => {
    table.dropColumn('saves_count');
  });
}
