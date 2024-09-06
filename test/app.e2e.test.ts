import { describe, it } from "vitest";
import request from "supertest";
import initialize from "../src/app.ts";
import type { Service, User } from "../src/service.ts";

class MockService implements Service {
  getUser(): Promise<User | undefined> {
    return Promise.resolve(undefined);
  }

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
    await request(app).post("/create-referral").send({ name: "" }).expect(400);
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
  });
});
