import express from "express";
import Ticket from "../Models/Ticket.js";

const router = express.Router();

router.post("/sellsheet", async (req, res) => {
  const { sheetNumber, name } = req.body;

  if (!sheetNumber || !name) {
    return res.status(400).json({ error: "Sheet number and name are required" });
  }

  const startTicket = (sheetNumber - 1) * 4 + 1;
  const endTicket = startTicket + 3;

  try {
    // Fetch tickets in the sheet
    const tickets = await Ticket.find({
      ticketNumber: { $gte: startTicket, $lte: endTicket }
    });

    // Check if any ticket is already sold
    const isAlreadySold = tickets.some(ticket => ticket.name);
    if (isAlreadySold) {
      return res.status(400).json({ error: "Sheet already sold" });
    }

    // Assign name to all 6 tickets
    await Ticket.updateMany(
      { ticketNumber: { $gte: startTicket, $lte: endTicket } },
      { $set: { name: name } }
    );

    return res.status(200).json({ message: "Sheet sold successfully" });
  } catch (error) {
    console.error("Error assigning tickets:", error);
    return res.status(500).json({ error: "Failed to assign sheet" });
  }
});

export default router;
