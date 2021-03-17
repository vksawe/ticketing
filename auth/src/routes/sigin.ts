import express, { Request, Response } from "express";
const { body } = require("express-validator");
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { Password } from "../services/password";
import { validateRequest } from "@alpinetickets/common";
import { BadRequestError } from "@alpinetickets/common";
const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must provide a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid Credentials");
    }
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid Credentials");
    }
    const userJWT = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );
    //Store it on sessionObject
    req.session = {
      jwt: userJWT,
    };
    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
