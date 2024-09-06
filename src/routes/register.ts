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

const schema: Schema = {
  name: {
    notEmpty: true,
  },
  phoneNumber: {
    isMobilePhone: {
      options: ["any"],
    },
  },
  email: {
    isEmail: true,
    normalizeEmail: true,
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
  await service.postUser(name, phoneNumber, email);
  return res.status(201).send();
}

export default function register(service: Service): Router {
  const router: Router = express.Router();

  // type assertion due to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/50871
  const handler = ((req: Request, res: Response) =>
    createUser(req, res, service)) as RequestHandler;

  router.post("/", checkSchema(schema), handler);

  return router;
}
