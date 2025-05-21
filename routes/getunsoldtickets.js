import express from "express";
const router = express.Router();
import Ticket from "../Models/Ticket.js";


router.get("/getunsoldtickets", async(req, res) => {

  const ticketsWithNoNames = await Ticket.find({ name: '' })
      .select('ticketNumber -_id')
      .sort({ ticketNumber: 1 });
      
const ticketNumbers = ticketsWithNoNames.map(ticket => ticket.ticketNumber);


  return res.status(200).json({ticketNumbers});
  
});

export default router;