import type { Knex } from "knex";
import { comparePassword, generateAccessToken, hashPassword } from "./auth.ts";

interface User {
  name: string;
  phoneNumber: string;
  email: string;
  referrerId: number | undefined;
  hashed_password: string;
}

interface DbUser {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  referrer_id: number | undefined;
  hashed_password: string;
}

interface DbReferral {
  referrer_id: number;
  referee_id: number;
}

export interface Service {
  getIdByEmail(email: string): Promise<number | undefined>;
  postUser(
    name: string,
    phoneNumber: string,
    email: string,
    password: string,
    referrerId: number | undefined,
  ): Promise<void>;
  /**
   * @returns token of the signed in user or null if user wasn't found
   */
  signIn(email: string, password: string): Promise<string | null>;
}

/**
 * @returns `true` if `id` exists in the db
 */
async function checkId(knex: Knex, id: number): Promise<boolean> {
  const row: User | undefined = await knex<User>("user")
    .where("id", id)
    .first();
  return Boolean(row);
}

export class RealService implements Service {
  constructor(private db: Knex) {}

  async getIdByEmail(email: string): Promise<number | undefined> {
    const queryBuilder = this.db<DbUser>("user");
    const user = (await queryBuilder
      .select("id")
      .where("email", email)
      .first()) satisfies Pick<DbUser, "id"> | undefined;
    return user?.id;
  }

  async postUser(
    name: string,
    phoneNumber: string,
    email: string,
    password: string,
    referrerId: number | undefined,
  ): Promise<void> {
    const hashedPassword = await hashPassword(password);

    if (referrerId === undefined) {
      return this.db<DbUser>("user")
        .insert({
          name,
          phone_number: phoneNumber,
          email,
          hashed_password: hashedPassword,
          referrer_id: referrerId,
        })
        .into("user");
    } else if (!(await checkId(this.db, referrerId))) {
      // check if referrer id exists to satisfy foreign key constraint
      return this.db<DbUser>("user")
        .insert({
          name,
          phone_number: phoneNumber,
          email,
        })
        .into("user");
    }

    const refereeId: number = (
      (await this.db("user").returning("id").insert({
        name,
        phone_number: phoneNumber,
        email,
        referrer_id: referrerId,
      })) satisfies Pick<DbUser, "id">[]
    )[0].id;

    return this.db<DbReferral>("referrals").insert({
      referrer_id: referrerId,
      referee_id: refereeId,
    });
  }

  private getUserByEmail(email: string): Promise<DbUser | undefined> {
    const user: Promise<DbUser | undefined> = this.db<DbUser>("user")
      .select("*")
      .where("email", email)
      .first();
    return user;
  }

  async signIn(email: string, pass: string): Promise<string | null> {
    const user: DbUser | undefined = await this.getUserByEmail(email);

    if (
      user === undefined ||
      !(await comparePassword(pass, user?.hashed_password))
    ) {
      return null;
    }
    return generateAccessToken(email);
  }
}

export default function setup(db: Knex): Service {
  return new RealService(db);
}
