import express from "express";
import tambola from "tambola-generator"; // ES module compatible import
import Ticket from "../Models/Ticket.js";
const router = express.Router();

// Function to generate 100 tickets
function generateTickets(n) {
  return tambola.default.generateTickets(n); // Use `default` if needed for ES modules
}

router.post("/generate-tickets", async (req, res) => {
  try {
    const {n}=req.body
    const tickets = generateTickets(Number(n));

const plainTickets = tickets.map(tickets => tickets._entries);
// console.log(plainTickets)
  const ticketsToSave = plainTickets.map((ticket, index) => ({
      ticket: ticket,
      ticketNumber: index + 1,
      name: ''
    }));

    await Ticket.deleteMany({});
       await Ticket.insertMany(ticketsToSave);
    res.json({ tickets });

  } catch (error) {
    console.error("Error generating tickets:", error);
    res.status(500).json({ error: "Failed to generate tickets" });
  }
});

export default router;
