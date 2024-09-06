import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import referral from "./routes/referral.ts";
import type { Service } from "./service.ts";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.get("/", (_req: Request, res: Response): void => {
  res.send("Hello World!");
});

export default function initialize(service: Service): Application {
  app.use("/create-referral", referral(service));
  return app;
}
