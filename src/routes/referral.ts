import express, {
  type Request,
  type RequestHandler,
  type Response,
  type Router,
} from "express";
import type { Service } from "../service.ts";
import { authenticateToken } from "../auth.ts";

async function createReferral(
  req: Request,
  res: Response,
  service: Service,
): Promise<Response> {
  // from authentication
  const email: string = res.locals["email"] as string;

  const id: number | undefined = await service.getIdByEmail(email);

  // in testing seems to identify host fine
  const host: string = req.headers.host ?? "localhost:3001";
  const url = `${host}/register?referrerId=${id}`;

  return res.send({ url });
}

export default function register(service: Service): Router {
  const router: Router = express.Router();

  // type assertion due to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/50871
  const handler = ((req: Request, res: Response) =>
    createReferral(req, res, service)) as RequestHandler;

  router.get("/", authenticateToken, handler);

  return router;
}
