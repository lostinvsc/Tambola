import express from "express";
const router = express.Router();
import Ticket from "../Models/Ticket.js";
import VoicePreference from "../Models/Voice.js";

router.get("/getsoldtickets", async(req, res) => {

    const tickets = await Ticket.find({ name: { $exists: true, $ne: '' } }).sort({ ticketNumber: 1 });

  return res.status(200).json({tickets});
  
});

export default router;