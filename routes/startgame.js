import express from 'express';
import Ticket from "../Models/Ticket.js";
import Winner from "../Models/Winners.js";
import { fullhouse, fourcorners, TopLine, MidLine, BottomLine, countMinusOnes } from "../controllers/patterns.js"
const router = express.Router();


let gameInterval = null;

router.post('/start-game', async (req, res) => {
    const { seconds, winConditions } = req.body;

    const io = req.app.get('io');

    if (!seconds || typeof seconds !== 'number' || seconds <= 0) {
        return res.status(400).json({ error: "Invalid 'seconds' value" });
    }

    // Clear any previous interval
    clearTimeout(gameInterval);

    const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

    const tickets = await Ticket.find({ name: { $exists: true, $ne: '' } });

    await Winner.deleteMany({});
    await Winner.create({});

    const drawNumber = async () => {
        if (availableNumbers.length === 0) {
            io.emit('game-over');
            return;
        }

        const index = Math.floor(Math.random() * availableNumbers.length);
        const number = availableNumbers.splice(index, 1)[0];
        let fullH = 0;
        const fullHW = [];
        io.emit('number', number);

        const newWinners = {
            fullHouse: [],
            topLine: [],
            midLine: [],
            bottomLine: [],
            fourCorners: [],
            earlyFive: [],
            earlySeven: [],
        };

        const winners = await Winner.findOne({});
        const l1 = winners.fullHouse.length;
        const l2 = winners.topLine.length;
        const l3 = winners.middleLine.length;
        const l4 = winners.bottomLine.length;
        const l5 = winners.fourCorners.length;
        const l6 = winners.earlyFive.length;
        const l7 = winners.earlySeven.length;


        for (const data of tickets) {
            for (let row = 0; row < data.ticket.length; row++) {
                for (let col = 0; col < data.ticket[row].length; col++) {
                    if (data.ticket[row][col] === number) {
                        data.ticket[row][col] = -1;
                    }
                }
            }

            if (winConditions.includes(1) && !l1 && fullhouse(data.ticket)) {
                newWinners.fullHouse.push(data.name);
                fullH = 1;
            }
            if (winConditions.includes(2) && !l2 && TopLine(data.ticket)) {
                newWinners.topLine.push(data.name);
            }
            if (winConditions.includes(3) && !l3 && MidLine(data.ticket)) {
                newWinners.midLine.push(data.name);
            }
            if (winConditions.includes(4) && !l4 && BottomLine(data.ticket)) {
                newWinners.bottomLine.push(data.name);
            }
            if (winConditions.includes(5) && !l5 && fourcorners(data.ticket)) {
                newWinners.fourCorners.push(data.name);
            }
            if ((winConditions.includes(6) && !l6)) {
                const minusCount = countMinusOnes(data.ticket);
                if (minusCount === 5) newWinners.earlyFive.push(data.name);

            }
            if ((winConditions.includes(7) && !l7)) {
                const minusCount = countMinusOnes(data.ticket);
                if (minusCount === 7) newWinners.earlySeven.push(data.name);
            }

            if (!fullH) {
                fullH = fullhouse(data.ticket);
                fullHW.push(data.name)
            }
        }

        winners.fullHouse.push(...newWinners.fullHouse);
        winners.topLine.push(...newWinners.topLine);
        winners.middleLine.push(...newWinners.midLine);
        winners.bottomLine.push(...newWinners.bottomLine);
        winners.fourCorners.push(...newWinners.fourCorners);
        winners.earlyFive.push(...newWinners.earlyFive);
        winners.earlySeven.push(...newWinners.earlySeven);

        let delay = seconds * 1000;

        if (
            newWinners.fullHouse.length ||
            newWinners.topLine.length ||
            newWinners.midLine.length ||
            newWinners.bottomLine.length ||
            newWinners.fourCorners.length ||
            newWinners.earlyFive.length ||
            newWinners.earlySeven.length
        ) {
            await winners.save();

          
            if (newWinners.topLine.length) {
                io.emit('new-winner', { type: "Top line", value: [...newWinners.topLine] });
            }
            if (newWinners.midLine.length) {
                io.emit('new-winner', { type: "Mid line", value: [...newWinners.midLine] });
            }
            if (newWinners.bottomLine.length) {
                io.emit('new-winner', { type: "Bottom line", value: [...newWinners.bottomLine] });
            }
            if (newWinners.fourCorners.length) {
                io.emit('new-winner', { type: "Four corners", value: [...newWinners.fourCorners] });
            }
            if (newWinners.earlyFive.length) {
                io.emit('new-winner', { type: "Early five", value: [...newWinners.earlyFive] });
            }
            if (newWinners.earlySeven.length) {
                io.emit('new-winner', { type: "Early seven", value: [...newWinners.earlySeven] });
            }
              if (newWinners.fullHouse.length) {
                io.emit('new-winner', { type: "Full House", value: [...newWinners.fullHouse] });
            } else if (fullH) {
                io.emit('new-winner', { type: "Full House", value: fullH });
            }

            if(seconds<5){
                delay += 4000;
            }
        }

        if (fullH || availableNumbers.length === 0) {
            setTimeout(() => {
                io.emit('game-over');
            }, 7000);
            return;
        }

        gameInterval = setTimeout(drawNumber, delay);
    };

    drawNumber();


    res.status(200).json({ message: 'Game started' });
});

export default router;
