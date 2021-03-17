import { OrderExpirationListener } from "../order-expiration-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { OrderStatus, ExpirationCompleteEvent } from "@alpinetickets/common";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
const setup = async () => {
  const listener = new OrderExpirationListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "Kendrick Lamar",
    price: 400,
  });
  await ticket.save();
  const order = Order.build({
    status: OrderStatus.Created,
    userId: "akladsjds",
    ticket,
    expiresAt: new Date(),
  });
  await order.save();
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, order, ticket, data, msg };
};

it("updates an order status to cancelled", async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("emit an Ordercancelled event ", async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});
it("ack the message", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
