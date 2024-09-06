import { describe, expect, it, vi } from "vitest";
import request, { type Response } from "supertest";
import initialize from "../src/app.ts";
import type { Service } from "../src/service.ts";

class MockService implements Service {
  getIdByEmail: (email: string) => Promise<number | undefined> = vi.fn(
    (email: string) => {
      return Promise.resolve(email.startsWith("return") ? 1 : undefined);
    },
  );

  postUser(): Promise<void> {
    return Promise.resolve(void null);
  }
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

describe("referral endpoint", () => {
  it("should error if email doesn't exist", async () => {
    await request(app)
      .get("/create-referral")
      .query({ email: "no@example.com" })
      .send()
      .expect(404)
      .expect((res: Response) => {
        expect(res.text).toMatch("no user with this email exists");
      });
  });

  it("should return a link with the right host", async () => {
    await request(app)
      .get("/create-referral")
      .query({ email: "return@example.com" })
      .send()
      .expect(200)
      .expect((res: Response) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const url: string = res.body.url as string;
        // host where the tests are run
        expect(url).toMatch(/127\.0\.0\.1:\d+\/register\?referrerId=1/);
      });
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
      })
      .expect(403)
      .expect((res: Response) => {
        expect(res.text).toMatch("this email is already in use");
      });
  });
});
