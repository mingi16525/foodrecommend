import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.integer('points').defaultTo(0);
    table.string('referral_code').unique();
  });

  await knex.schema.createTable('loyalty_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('points_change').notNullable(); // positive for earn, negative for spend
    table.string('reason').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('loyalty_history');
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('points');
    table.dropColumn('referral_code');
  });
}
