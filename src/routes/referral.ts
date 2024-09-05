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

const schema: Schema = { name: { notEmpty: true, escape: true, in: "body" } };

async function createReferral(
  req: Request,
  res: Response,
  service: Service,
): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  console.log(await service.getUser());

  const data = matchedData(req);
  return res.send(`creating a referral link from ${data["name"]}`);
}

export default function register(service: Service): Router {
  const router: Router = express.Router();

  // type assertion due to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/50871
  const handler = ((req: Request, res: Response) =>
    createReferral(req, res, service)) as RequestHandler;

  router.post("/", checkSchema(schema), handler);

  return router;
}
