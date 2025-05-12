import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticket: {
    type: [[Number]], // 2D array of numbers
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  ticketNumber: {
    type: Number,
    required: true,
    unique: true
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
