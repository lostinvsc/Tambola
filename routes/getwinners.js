import express from 'express';
import Winner from '../Models/Winners.js'; // Ensure file extension is .js

const router = express.Router();

// GET /getwinners
router.get('/getwinners', async (req, res) => {
    try {
        const winners = await Winner.findOne({});
    
        if (!winners) {
            return res.status(404).json({ message: 'No winner data found' });
        }
        // console.log(winners)
        res.status(200).json(winners);
    } catch (error) {
        console.error('Error fetching winners:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
