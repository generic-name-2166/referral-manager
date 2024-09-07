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
import { PurchaseResult, type Service } from "../service.ts";
import { authenticateToken } from "../auth.ts";

export interface Course {
  id: 0 | 1 | 2 | 3;
  name: string;
}

const courses: Course[] = [
  { id: 0, name: "Course 1" },
  { id: 1, name: "Course 2" },
  { id: 2, name: "Course 3" },
  { id: 3, name: "Course 4" },
];

function listCourses(_req: Request, res: Response): Response {
  return res.send({ courses });
}

const schema: Schema = {
  cardNumber: {
    isCreditCard: true,
  },
  expiryDate: {
    notEmpty: true,
  },
  courseId: {
    isInt: true,
    toInt: true,
  },
};

async function buyCourse(
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
  const cardNumber: string = data["cardNumber"];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const expiryDate: string = data["expiryDate"];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const courseId: number = data["courseId"];

  // from authentication
  const email: string = res.locals["email"] as string;
  const id: number = (await service.getIdByEmail(email))!;

  const status: PurchaseResult = await service.processPayment(
    id,
    courseId,
    cardNumber,
    expiryDate,
  );
  switch (status) {
    case PurchaseResult.IncorrectInfo:
      return res.status(400).send("incorrect payment information");
    case PurchaseResult.AlreadyOwned:
      return res.status(409).send("you already own this course");
    case PurchaseResult.Success:
      return res.sendStatus(201);
  }
}

export default function register(service: Service): Router {
  const router: Router = express.Router();

  // type assertion due to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/50871
  const postHandler = ((req: Request, res: Response) =>
    buyCourse(req, res, service)) as RequestHandler;

  router.get("/", listCourses);
  router.post("/", authenticateToken, checkSchema(schema), postHandler);

  return router;
}
