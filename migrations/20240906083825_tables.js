/**
 * @param { import("knex").Knex.CreateTableBuilder } table
 */
function createUserTable(table) {
  table.increments("id");
  table.string("name").notNullable();
  table.string("phone_number").notNullable();
  table.string("email").notNullable().unique();
  table.text("hashed_password").notNullable();
  table.integer("referrer_id").nullable().references("id").inTable("user");
}

/**
 * @param { import("knex").Knex.CreateTableBuilder } table
 */
function createPaymentTable(table) {
  table.increments("id");
  table.smallint("course_id").notNullable();
  table.integer("student_id").notNullable();
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable("user", createUserTable)
    .createTable("payment", createPaymentTable);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("payment").dropTableIfExists("user");
}
