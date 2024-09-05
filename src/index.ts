import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import referral from "./routes/referral.ts";
import dbSetup from "./db.ts";
import setup, { type Service } from "./service.ts";

const app: Application = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const service: Service = setup(dbSetup());

app.get("/", (_req: Request, res: Response): void => {
  res.send("Hello World!");
});

app.use("/create-referral", referral(service));

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}/`);
});
