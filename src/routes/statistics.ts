import express, {
  type Request,
  type RequestHandler,
  type Response,
  type Router,
} from "express";
import type { Service, User } from "../service.ts";
import { authenticateToken } from "../auth.ts";

async function showStatistics(
  res: Response,
  service: Service,
): Promise<Response> {
  // from authentication
  const email: string = res.locals["email"] as string;

  const referees: User[] = await service.getReferees(email);

  return res.send(referees);
}

export default function register(service: Service): Router {
  const router: Router = express.Router();

  // type assertion due to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/50871
  const handler = ((_req: Request, res: Response) =>
    showStatistics(res, service)) as RequestHandler;

  router.get("/", authenticateToken, handler);

  return router;
}
