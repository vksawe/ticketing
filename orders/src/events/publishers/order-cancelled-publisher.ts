import {
  Subjects,
  OrderCancelledEvent,
  Publisher,
} from "@alpinetickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
