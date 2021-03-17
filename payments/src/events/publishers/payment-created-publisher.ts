import {
  Publisher,
  Subjects,
  PaymentCreatedEvent,
} from "@alpinetickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
