import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Add device_token to users
  await knex.schema.alterTable('users', (table) => {
    table.string('device_token').nullable();
  });

  // Create payments table
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('group_order_id').references('id').inTable('group_orders').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency').defaultTo('VND');
    table.enum('status', ['PENDING', 'SUCCESS', 'FAILED']).defaultTo('PENDING');
    table.string('payment_method').defaultTo('MOMO');
    table.string('transaction_id').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments');
  
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('device_token');
  });
}
