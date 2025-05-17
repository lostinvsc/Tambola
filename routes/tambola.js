import express from "express";
import { generateTambolaTicketsWithRetry } from "../controllers/generatesheet.js";
import Ticket from "../Models/Ticket.js";
const router = express.Router();

router.post("/generate-tickets", async (req, res) => {
  try {
    const { n } = req.body;

    await Ticket.deleteMany({}); // Clear previous tickets

    let ticketCounter = 1; // to assign ticketNumber starting from 1
    const allSavedTickets = [];

    for (let i = 0; i < n; i++) {
      const sheetTickets = generateTambolaTicketsWithRetry(); // this returns an array of tickets (each ticket is 2D array)
      
      // Save each ticket of this sheet to DB with a unique ticketNumber
      for (const ticketArr of sheetTickets) {
        const newTicket = new Ticket({
          ticket: ticketArr,
          ticketNumber: ticketCounter++
        });
        await newTicket.save();
        allSavedTickets.push(newTicket);
      }
    }

    res.json({ tickets: allSavedTickets }); 

  } catch (error) {
    console.error("Error generating tickets:", error);
    res.status(500).json({ error: "Failed to generate tickets" });
  }
});


export default router;
