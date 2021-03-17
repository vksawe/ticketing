import { Ticket } from "../tickets";

it("Implements Optimistic concurency Control", async (done) => {
  const ticket = Ticket.build({
    title: "HARMOONIZEEEEE",
    price: 2,
    userId: "655",
  });
  await ticket.save();
  const firstInsatnce = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInsatnce!.set({ price: 10 });

  await firstInsatnce!.save();
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }
  throw new Error("Should not get here");
});

it("Increments version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    userId: "1265",
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
