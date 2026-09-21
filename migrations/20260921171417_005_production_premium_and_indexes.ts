import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('subscription_tier').defaultTo('FREE').notNullable();
    table.timestamp('subscription_expires_at').nullable();
  });

  // Indexes for performance
  await knex.schema.alterTable('users', (table) => {
    table.index('email');
  });

  await knex.schema.alterTable('group_members', (table) => {
    table.index('group_id');
    table.index('user_id');
  });

  await knex.schema.alterTable('group_orders', (table) => {
    table.index('group_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('group_orders', (table) => {
    table.dropIndex('group_id');
  });

  await knex.schema.alterTable('group_members', (table) => {
    table.dropIndex('group_id');
    table.dropIndex('user_id');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropIndex('email');
    table.dropColumn('subscription_tier');
    table.dropColumn('subscription_expires_at');
  });
}
