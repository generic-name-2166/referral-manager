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

const schema: Schema = { email: { isEmail: true } };

async function createReferral(
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

  const id: number | undefined = await service.getIdByEmail(email);
  if (id === undefined) {
    return res.status(404).send("no user with this email exists");
  }

  // in testing, seems to identify host fine
  const host: string = req.headers.host ?? "localhost:3001";
  const url = `${host}/register?referrerId=${id}`;

  return res.send({ url });
}

export default function register(service: Service): Router {
  const router: Router = express.Router();

  // type assertion due to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/50871
  const handler = ((req: Request, res: Response) =>
    createReferral(req, res, service)) as RequestHandler;

  router.get("/", checkSchema(schema), handler);

  return router;
}
