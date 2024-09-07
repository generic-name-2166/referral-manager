import { describe, expect, it, vi } from "vitest";
import request, { type Response } from "supertest";
import initialize from "../src/app.ts";
import type { Service } from "../src/service.ts";
import { generateAccessToken } from "../src/auth.ts";

class MockService implements Service {
  getIdByEmail: (email: string) => Promise<number | undefined> = vi.fn(
    (email: string) => {
      return Promise.resolve(email.startsWith("return") ? 1 : undefined);
    },
  );

  postUser(): Promise<void> {
    return Promise.resolve(void null);
  }

  signIn: (email: string, password: string) => Promise<string | null> = vi.fn(
    (email: string) =>
      Promise.resolve(
        email.startsWith("return") ? generateAccessToken(email) : null,
      ),
  );
}

const service: Service = new MockService();

const app = initialize(service);

describe("App", () => {
  it("should start", async () => {
    await request(app).get("/").expect(200);
  });

  it("should validate post requests", async () => {
    await request(app).post("/register").send({ name: "" }).expect(400);
  });
});

async function signUp(email: string, existing: boolean): Promise<string> {
  let token = "";

  if (existing) {
    await request(app)
      .post("/register/renew")
      .send({
        email,
        password: "a",
      })
      .then((res) => (token = res.text));
  } else {
    await request(app)
      .post("/register")
      .send({
        email,
        name: "a",
        phoneNumber: "1-202-456-1111",
        password: "a",
      })
      .then((res) => (token = res.text));
  }

  return token;
}

describe("referral endpoint", () => {
  it("should return a link with the right host", async () => {
    const existing = await signUp("return@example.org", true);
    console.log(existing);

    await request(app)
      .get("/create-referral")
      .auth(existing, { type: "bearer" })
      .send()
      .expect(200)
      .expect((res: Response) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const url: string = res.body.url as string;
        // host where the tests are run
        expect(url).toMatch(/127\.0\.0\.1:\d+\/register\?referrerId=1/);
      });
  });

  it("should authenticate", async () => {
    await request(app).get("/create-referral").send().expect(401);
  });
});

describe("registration endpoint", () => {
  it("should create a user on post", async () => {
    await request(app)
      .post("/register")
      .send({
        name: "John Doe",
        phoneNumber: "1-202-456-1111",
        email: "john@example.org",
        password: "a",
      })
      .expect(201);
  });

  it("should accept referrals", async () => {
    await request(app)
      .post("/register")
      .query({ referrerId: 1 })
      .send({
        name: "John Doe",
        phoneNumber: "1-202-456-1111",
        email: "john@example.org",
        password: "a",
      })
      .expect(201);
  });

  it("should forbid duplicate emails", async () => {
    await request(app)
      .post("/register")
      .send({
        name: "a",
        phoneNumber: "1-202-456-1111",
        email: "return@example.org",
        password: "a",
      })
      .expect(403)
      .expect((res: Response) => {
        expect(res.text).toMatch("this email is already in use");
      });
  });

  it("should renew tokens for users", async () => {
    await request(app)
      .post("/register/renew")
      .send({
        email: "return@example.org",
        password: "a",
      })
      .expect(200)
      .expect((res: Response) => {
        expect(res.text).toBeTypeOf("string");
        expect(res.text.length).toBeGreaterThan(1);
      });
  });

  it("shouldn't renew incorrect credentials", async () => {
    await request(app)
      .post("/register/renew")
      .send({
        email: "johndoe@example.org",
        password: "a",
      })
      .expect(401)
      .expect((res: Response) => {
        expect(res.text).toMatch("incorrect email or password");
      });
  });
});
