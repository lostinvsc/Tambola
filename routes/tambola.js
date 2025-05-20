import express from "express";
import tambola from 'tambola-generator';
import Ticket from "../Models/Ticket.js";

const router = express.Router();

function generateTickets(n) {
  return tambola.default.generateTickets(n); 
}

router.post("/generate-tickets", async (req, res) => {
  try {
    const { n } = req.body;

    const tickets = generateTickets(n);

    const plainTickets = tickets.map(ticket => ticket._entries);
    
    const ticketsToSave = plainTickets.map((ticket, index) => ({
      ticket,
      ticketNumber: index + 1,
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

















// import express from "express";
// import { generateTambolaTicketsWithRetry } from "../controllers/generatesheet.js";
// import Ticket from "../Models/Ticket.js";

// const router = express.Router();

// // Delay function (returns a Promise that resolves after ms milliseconds)
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// router.post("/generate-tickets", async (req, res) => {
//   try {
//     const { n } = req.body;

//     await Ticket.deleteMany({}); // Clear previous tickets

//     let ticketCounter = 1;
//     const allSavedTickets = [];

//     for (let i = 0; i < n; i++) {
//       const sheetTickets = generateTambolaTicketsWithRetry();

//       for (const ticketArr of sheetTickets) {
//         allSavedTickets.push({
//           ticket: ticketArr,
//           ticketNumber: ticketCounter++
//         });
//       }

//       await delay(130); // Delay after each sheet
//     }

//         allSavedTickets.sort((a, b) => a.ticketNumber - b.ticketNumber);

//     const insertedTickets = await Ticket.insertMany(allSavedTickets);

//     res.json({ tickets: insertedTickets });

//   } catch (error) {
//     console.error("Error generating tickets:", error);
//     res.status(500).json({ error: "Failed to generate tickets" });
//   }
// });

// export default router;
