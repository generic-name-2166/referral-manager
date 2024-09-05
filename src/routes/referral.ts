import express, { type Request, type Response, type Router } from "express";
import {
  checkSchema,
  matchedData,
  validationResult,
  type Schema,
} from "express-validator";

const schema: Schema = { name: { notEmpty: true, escape: true, in: "body" } };

function createReferral(req: Request, res: Response): Response {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  const data = matchedData(req);
  return res.send(`creating a referral link from ${data["name"]}`);
}

const router: Router = express.Router();

router.post("/", checkSchema(schema), createReferral);

export default router;
