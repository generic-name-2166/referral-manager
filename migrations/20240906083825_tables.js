/**
 * @param { import("knex").Knex.CreateTableBuilder } table
 */
function createUserTable(table) {
  table.increments("id");
  table.string("name").notNullable();
  table.string("phone_number").notNullable();
  table.string("email").notNullable();
}

/**
 * @param { import("knex").Knex.CreateTableBuilder } table
 */
function createReferralsTable(table) {
  table.integer("referrer_id").notNullable();
  table.integer("referee_id").notNullable();
  table.foreign("referrer_id").references("id").inTable("user");
  table.foreign("referee_id").references("id").inTable("user");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable("user", createUserTable)
    .createTable("referrals", createReferralsTable);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("referrals").dropTableIfExists("user");
}
