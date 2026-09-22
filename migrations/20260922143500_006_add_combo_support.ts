import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('dishes', (table) => {
    table.text('description').nullable();
    table.string('item_type').defaultTo('single').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('dishes', (table) => {
    table.dropColumn('description');
    table.dropColumn('item_type');
  });
}
