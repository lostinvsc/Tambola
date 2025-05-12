import { Router } from 'express';
import VoicePreference from "../Models/Voice.js";
const router = Router();


router.post('/setvoice', async (req, res) => {
    const { voice } = req.body;
    await VoicePreference.deleteMany({});
    const voicc = await VoicePreference.insertOne({ voiceType: voice });
    if (!voice) {
        return res.status(400).json({ message: 'voice is required' });
    }

    return res.status(200).json({ message: "voice type received successfully" });

});

router.get('/getvoice', async (req, res) => {
 
     const voice=await VoicePreference.findOne({});

    return res.status(200).json({voice});

});


export default router;
