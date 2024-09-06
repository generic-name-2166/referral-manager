import initialize from "./app.ts";
import db from "./db.ts";
import setup, { type Service } from "./service.ts";

const service: Service = setup(db());
const port = 3000;

const app = initialize(service);

const server = app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

server.on("error", console.error);
