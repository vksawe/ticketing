import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@alpinetickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
