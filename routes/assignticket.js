import express from "express";
import Ticket from "../Models/Ticket.js";

const router = express.Router();

router.post("/assign-ticket", async(req, res) => {
  const { ticketNumber, name } = req.body;
  
  if (ticketNumber==undefined||null || !name) {
    return res.status(400).json({ error: "Ticket number and name are required" });
  }
  try {

 const updatedTicket = await Ticket.findOneAndUpdate( { ticketNumber:ticketNumber },{ $set: { name } },               
    );

  if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.status(200).json({ message: "Ticket assigned successfully" });
  } catch (error) {
    console.error("Error assigning ticket:", error);
    return res.status(500).json({ error: "Failed to assign ticket" });
  }
  
});

export default router;