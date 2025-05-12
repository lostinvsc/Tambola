import express from "express";
const router = express.Router();
import Ticket from "../Models/Ticket.js";
router.get("/gettickets", async(req, res) => {

    const tickets=await Ticket.find({});
  return res.status(200).json({tickets});
  
});

export default router;