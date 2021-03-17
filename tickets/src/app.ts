import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler } from "@alpinetickets/common";
import { indexTicketRouter } from "./routes/index";
import { NotFoundError, currentUser } from "@alpinetickets/common";
import { showTicketRouter } from "./routes/show";
import { createTicketRouter } from "./routes/new";
import { updateTicketRouter } from "./routes/update";
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

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);
app.use(errorHandler);
app.get("/api/users/currentUser", (req, res) => {
  res.send("Hi there");
});

app.all("*", () => {
  throw new NotFoundError();
});

export { app };
