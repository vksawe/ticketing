import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
jest.mock("../nats-wrapper");
import { app } from "../app";
import request from "supertest";
declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}
let mongo: any;
process.env.STRIPE_KEY =
  "sk_test_51HjqBSDHXahxj7hv4NNDiDKTxEwPRFORQldHTQWXPoJSBAJm6B9J95uPG0Orxr4foev8dRiLeUPljtZ6NGMqPOwU00Wh3m26SF";

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  //bUILD A jwt payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };
  //Create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //build session object
  const session = { jwt: token };
  //turn session into json
  const sessionJSON = JSON.stringify(session);
  //encode session as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`express:sess=${base64}`];
};
