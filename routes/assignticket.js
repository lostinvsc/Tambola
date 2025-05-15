import express from "express";
import Ticket from "../Models/Ticket.js";

const router = express.Router();

router.post("/assign-ticket", async(req, res) => {
  const { ticketNumber, name } = req.body;
  
  if (ticketNumber==undefined||null || !name) {
    return res.status(400).json({ error: "Ticket number and name are required" });
  }
  try {

    const ticket = await Ticket.findOne({ ticketNumber });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    if (ticket.name) {
      return res.status(400).json({ error: "Already sold, refresh to see" });
    }

    ticket.name = name;
    await ticket.save();

    return res.status(200).json({ message: "Ticket assigned successfully" });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return res.status(500).json({ error: "Failed to assign ticket" });
  }
  
});

export default router;