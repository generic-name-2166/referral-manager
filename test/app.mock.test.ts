import { beforeAll, describe, expect, it, vi } from "vitest";
import request, { type Response } from "supertest";
import initialize from "../src/app.ts";
import { PurchaseResult, type Service } from "../src/service.ts";
import { generateAccessToken } from "../src/auth.ts";
import type { Course } from "../src/routes/payment.ts";

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

  processPayment: (
    studentId: number,
    courseId: number,
    cardNumber: string,
    expiryDate: string,
  ) => Promise<PurchaseResult> = vi.fn(
    (
      _studentId: number,
      _courseId: number,
      _cardNumber: string,
      expiryDate: string,
    ) => {
      let result: PurchaseResult;
      if (expiryDate.endsWith("incorrect")) {
        result = PurchaseResult.IncorrectInfo;
      } else if (expiryDate.endsWith("owned")) {
        result = PurchaseResult.AlreadyOwned;
      } else {
        result = PurchaseResult.Success;
      }
      return Promise.resolve(result);
    },
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

    await request(app)
      .get("/create-referral")
      .auth(existing, { type: "bearer" })
      .send()
      .expect(200)
      .expect((res: Response) => {
        expect(res.text).toMatch(/127\.0\.0\.1:\d+\/register\?referrerId=1/);
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

describe("payment endpoint", () => {
  let token: string;

  beforeAll(async () => {
    token = await signUp("return@example.org", true);
  });

  it("should list available courses", async () => {
    await request(app)
      .get("/courses")
      .auth(token, { type: "bearer" })
      .send()
      .expect(200)
      .expect((res: Response) => {
        const body = res.body as { courses: Course[] };
        expect(Array.isArray(body.courses)).toBe(true);
        expect(body.courses[0].id).toBeTypeOf("number");
        expect(body.courses[0].name).toBeTypeOf("string");
      });
  });

  it("should accept payment info", async () => {
    await request(app)
      .post("/courses")
      .auth(token, { type: "bearer" })
      .send({
        cardNumber: "4242424242424242",
        expiryDate: "12/34",
        courseId: 0,
      })
      .expect(201);
  });

  it("should fail incorrect payment info", async () => {
    await request(app)
      .post("/courses")
      .auth(token, { type: "bearer" })
      .send({
        cardNumber: "4242424242424242",
        expiryDate: "12/34incorrect",
        courseId: 0,
      })
      .expect(400)
      .expect((res: Response) => {
        expect(res.text).toMatch("incorrect payment information");
      });
  });

  it("should fail buying an already owned course", async () => {
    await request(app)
      .post("/courses")
      .auth(token, { type: "bearer" })
      .send({
        cardNumber: "4242424242424242",
        expiryDate: "12/34owned",
        courseId: 0,
      })
      .expect(409)
      .expect((res: Response) => {
        expect(res.text).toMatch("you already own this course");
      });
  });
});
