import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@alpinetickets/common";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 142,
  });
  await ticket.save();

  const data: TicketUpdatedEvent["data"] = {
    id: ticket!.id,
    title: "Maroon 5",
    version: ticket.version + 1,
    price: 400,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  const data2: TicketUpdatedEvent["data"] = {
    id: ticket!.id,
    title: "Maroon 6",
    version: data.version + 1,
    price: 999,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket, data2 };
};

it("Creates and saves and Updates a ticket", async () => {
  const { listener, data, msg, ticket, data2 } = await setup();
  await listener.onMessage(data, msg);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.version).toBe(1);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  await listener.onMessage(data2, msg);
  const updatedTicket2 = await Ticket.findById(updatedTicket!.id);
  expect(updatedTicket2!.version).toBe(2);
});

it("acks the message", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a future version", async () => {
  const { listener, data, msg, ticket, data2 } = await setup();
  try {
    await listener.onMessage(data2, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
