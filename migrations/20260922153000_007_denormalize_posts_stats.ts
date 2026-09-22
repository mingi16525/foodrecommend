import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add new columns
  await knex.schema.alterTable('posts', (table) => {
    table.integer('likes_count').defaultTo(0);
    table.integer('comments_count').defaultTo(0);
  });

  // Backfill existing data
  await knex.raw(`
    UPDATE posts
    SET 
      likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id),
      comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.id)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('posts', (table) => {
    table.dropColumn('likes_count');
    table.dropColumn('comments_count');
  });
}
