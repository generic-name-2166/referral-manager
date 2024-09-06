import type { Knex } from "knex";

interface User {
  name: string;
  phoneNumber: string;
  email: string;
  referrerId: number | undefined;
}

interface DbUser extends User {
  id: number;
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
    referrerId: number | undefined,
  ): Promise<void>;
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
    referrerId: number | undefined,
  ): Promise<void> {
    if (referrerId === undefined) {
      return this.db("user")
        .insert({
          name,
          phone_number: phoneNumber,
          email,
          referrerId: referrerId,
        })
        .into("user");
    } else if (!(await checkId(this.db, referrerId))) {
      // check if referrer id exists to satisfy foreign key constraint
      return this.db("user")
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
}

export default function setup(db: Knex): Service {
  return new RealService(db);
}
