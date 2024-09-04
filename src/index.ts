import express, { type Application } from "express";

const app: Application = express();
const port = 3000;

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
