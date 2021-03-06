import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler } from "@alpinetickets/common";
import { indexOrderRouter } from "./routes/index";
import { NotFoundError, currentUser } from "@alpinetickets/common";
import { showOrderRouter } from "./routes/show";
import { newOrderRouter } from "./routes/new";
import { deleteOrderRouter } from "./routes/delete";
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

app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);
app.use(newOrderRouter);
app.use(errorHandler);
app.get("/api/users/currentUser", (req, res) => {
  res.send("Hi there");
});

app.all("*", () => {
  throw new NotFoundError();
});

export { app };
