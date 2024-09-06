import type { Knex } from "knex";

export interface User {
  name: string;
  phoneNumber: string;
  email: string;
}

export interface Service {
  getUser(): Promise<User | undefined>;
  postUser(name: string, phoneNumber: string, email: string): Promise<void>;
}

export class RealService implements Service {
  constructor(private db: Knex) {}

  getUser(): Promise<User | undefined> {
    const queryBuilder = this.db<User>("user");
    const user: Promise<User | undefined> = queryBuilder.select("*").first();
    return user;
  }

  postUser(name: string, phoneNumber: string, email: string): Promise<void> {
    const queryBuilder = this.db("user");
    return queryBuilder
      .insert({ name, phone_number: phoneNumber, email })
      .into("user");
  }
}

export default function setup(db: Knex): Service {
  return new RealService(db);
}
