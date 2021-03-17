import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler } from "@alpinetickets/common";
import { createChargeRouter } from "./routes/new";

import { NotFoundError, currentUser } from "@alpinetickets/common";
const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV == "test",
  })
);
app.use(currentUser);

app.get("/api/users/currentUser", (req, res) => {
  res.send("Hi there");
});
app.use(createChargeRouter);
app.all("*", () => {
  throw new NotFoundError();
});
app.use(errorHandler);
export { app };
