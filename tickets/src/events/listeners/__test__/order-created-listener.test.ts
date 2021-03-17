import { OrderCreatedListener } from "../../listeners/order-created-listener";
import { OrderCreatedEvent } from "@alpinetickets/common";
import mongoose, { set } from "mongoose";
import { Ticket } from "../../../models/tickets";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { TicketCreatedEvent, OrderStatus } from "@alpinetickets/common";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const ticket = await Ticket.build({
    title: "Sauti soll show",
    price: 5223,
    userId: "fh7887",
  });
  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: "2020",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};

it("Updates orderId value in ticket", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const fetchedTicket = await Ticket.findById(ticket.id);
  expect(fetchedTicket!.orderId).not.toBeNull();
  expect(fetchedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
it("Publishes a ticket updated event", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    //@ts-ignore
    natsWrapper.client.publish.mock.calls[0][1]
  );
  //===
  //(natsWrapper.client.publish as jest.Mock).mock.calls[0][1];

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
