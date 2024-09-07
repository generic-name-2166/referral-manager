import express, {
  type Request,
  type RequestHandler,
  type Response,
  type Router,
} from "express";
import {
  checkSchema,
  matchedData,
  validationResult,
  type Schema,
} from "express-validator";
import type { Service } from "../service.ts";
import { generateAccessToken } from "../auth.ts";

const schema: Schema = {
  name: {
    notEmpty: true,
    in: "body",
  },
  phoneNumber: {
    isMobilePhone: {
      options: ["any"],
    },
    in: "body",
  },
  email: {
    isEmail: true,
    normalizeEmail: true,
    in: "body",
  },
  password: {
    notEmpty: true,
    in: "body",
  },
  referrerId: {
    optional: true,
    isInt: true,
    toInt: true,
    in: "query",
  },
};
const renewSchema: Schema = {
  email: {
    isEmail: true,
    normalizeEmail: true,
    in: "body",
  },
  password: {
    notEmpty: true,
    in: "body",
  },
};

async function createUser(
  req: Request,
  res: Response,
  service: Service,
): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  const data = matchedData(req);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const name: string = data["name"];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const phoneNumber: string = data["phoneNumber"];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const email: string = data["email"];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const referrerId: number | undefined = data["referrerId"];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const password: string = data["password"];

  if ((await service.getIdByEmail(email)) !== undefined) {
    return res.status(403).send("this email is already in use");
  }

  await service.postUser(name, phoneNumber, email, password, referrerId);

  const token = generateAccessToken(email);

  return res.status(201).send(token);
}

async function renewUser(
  req: Request,
  res: Response,
  service: Service,
): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  const data = matchedData(req);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const email: string = data["email"];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const password: string = data["password"];

  const token: string | null = await service.signIn(email, password);

  if (token === null) {
    return res.status(401).send("incorrect email or password");
  }

  return res.status(200).send(token);
}

export default function register(service: Service): Router {
  const router: Router = express.Router();

  // type assertion due to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/50871
  const renew = ((req: Request, res: Response) =>
    renewUser(req, res, service)) as RequestHandler;
  const handler = ((req: Request, res: Response) =>
    createUser(req, res, service)) as RequestHandler;

  router.post("/", checkSchema(schema), handler);
  router.post("/renew", checkSchema(renewSchema), renew);

  return router;
}
