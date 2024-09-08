import knex, { type Knex } from "knex";

export default function setup(): Knex {
  return knex({
    client: "pg",
    connection: {
      host: process.env["POSTGRES_HOST"] ?? "localhost",
      port: 5432,
      user: "postgres",
      password: "postgres",
      database: "referral_manager",
    },
  }) satisfies Knex;
}
