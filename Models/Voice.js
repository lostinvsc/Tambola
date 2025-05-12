import mongoose from "mongoose";

const VoicePreferenceSchema = new mongoose.Schema({
  voiceType: {
    type: String,
    enum: ['male', 'female'],
    required: true,
    default: 'female'
  }
}, {
  timestamps: true
});

const VoicePreference = mongoose.model('VoicePreference', VoicePreferenceSchema);

export default VoicePreference;