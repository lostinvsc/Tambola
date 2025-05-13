import 'dotenv/config';
import express from "express";
import { Server as SocketIOServer } from "socket.io"; // Fix: Alias the import properly
import cors from "cors";
import http from "http";
import mongoose from 'mongoose';

import winnersRoute from './routes/getwinners.js';
import generateTicketsRoute from "./routes/tambola.js";
import assignticket from "./routes/assignticket.js";
import getTickets from "./routes/gettickets.js";
import startGameRoute from "./routes/startgame.js";
import getsoldtickets from "./routes/getsoldtickets.js";
import getunsoldtickets from "./routes/getunsoldtickets.js";
import loginroute from "./routes/login.js";
import voiceroute from "./routes/voice.js";
 

const app = express();
const port = process.env.PORT || 10000;
const conn=process.env.MONGO_URI || 'mongodb://localhost:27017/tambola'
// MongoDB connection
mongoose.connect(conn).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// HTTP and Socket.IO server
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach `io` instance to app so routes can use it
app.set("io", io);

// Socket.IO handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Routes
app.use('/api', generateTicketsRoute);
app.use('/api', assignticket);
app.use('/api', getTickets);
app.use('/api', startGameRoute);
app.use('/api', winnersRoute)
app.use('/api', getsoldtickets)
app.use('/api', loginroute)
app.use('/api', voiceroute)
app.use('/api', getunsoldtickets)


// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
