import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema({
  fullHouse: { type: [String], default: [] },
  topLine: { type: [String], default: [] },
  middleLine: { type: [String], default: [] },
  bottomLine: { type: [String], default: [] },
  fourCorners: { type: [String], default: [] },
  earlyFive: { type: [String], default: [] },
  earlySeven: { type: [String], default: [] }
}, {
  timestamps: true
});

const Winner = mongoose.model('Winner', winnerSchema);

export default Winner;
