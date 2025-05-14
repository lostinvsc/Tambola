import express from 'express';
import Ticket from "../Models/Ticket.js";
import Winner from "../Models/Winners.js";
import CurrentWinner from '../Models/Winpattern.js';
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

    await CurrentWinner.deleteMany({});
    await CurrentWinner.create({});


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

        const currentwin = {
            fullHouse: [],
            topLine: [],
            middleLine: [],
            bottomLine: [],
            fourCorners: [],
            earlyFive: [],
            earlySeven: [],
        };

        const winners = await Winner.findOne({});
        const cwinners = await CurrentWinner.findOne({});
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

            if (fullhouse(data.ticket)) {
                currentwin.fullHouse.push(data.name);
                if (winConditions.includes(1) && !l1) {
                    newWinners.fullHouse.push(data.name);
                }
            }
            if (TopLine(data.ticket)) {
                currentwin.topLine.push(data.name);
                if (winConditions.includes(2) && !l2) {
                    newWinners.topLine.push(data.name);
                }
            }

            // Middle Line
            if (MidLine(data.ticket)) {
                currentwin.middleLine.push(data.name);
                if (winConditions.includes(3) && !l3) {
                    newWinners.midLine.push(data.name);
                }
            }

            // Bottom Line
            if (BottomLine(data.ticket)) {
                currentwin.bottomLine.push(data.name);
                if (winConditions.includes(4) && !l4) {
                    newWinners.bottomLine.push(data.name);
                }
            }

            // Four Corners
            if (fourcorners(data.ticket)) {
                currentwin.fourCorners.push(data.name);
                if (winConditions.includes(5) && !l5) {
                    newWinners.fourCorners.push(data.name);
                }
            }

            // Early Five
            const minusCount = countMinusOnes(data.ticket);
            if (minusCount === 5) {
                currentwin.earlyFive.push(data.name);
                if (winConditions.includes(6) && !l6) {
                    newWinners.earlyFive.push(data.name);
                }
            }

            // Early Seven
            if (minusCount === 7) {
                currentwin.earlySeven.push(data.name);
                if (winConditions.includes(7) && !l7) {
                    newWinners.earlySeven.push(data.name);
                }
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
        }

        // const cwinners = await CurrentWinner.findOne({});
        const winnerTypes = [
            "fullHouse",
            "topLine",
            "middleLine",
            "bottomLine",
            "fourCorners",
            "earlyFive",
            "earlySeven",
        ];

        let hasNewWinners = false;

        for (const type of winnerTypes) {
            if (!Array.isArray(cwinners[type])) {
                cwinners[type] = [];
            }

            if (!Array.isArray(currentwin[type])) {
                currentwin[type] = [];
            }

            // Filter unique names only
            const uniqueNames = currentwin[type].filter(
                name => !cwinners[type].includes(name)
            );

            // If there are any new winners for this type, mark flag
            if (uniqueNames.length > 0) {
                hasNewWinners = true;
                cwinners[type].push(...uniqueNames);
            }

            // Update currentwin to only have names that were actually added
            currentwin[type] = uniqueNames;
        }

        // Save only if there was any new winner
        if (hasNewWinners) {
            await cwinners.save();
        }


        if (
            currentwin.fullHouse.length ||
            currentwin.topLine.length ||
            currentwin.middleLine.length ||
            currentwin.bottomLine.length ||
            currentwin.fourCorners.length ||
            currentwin.earlyFive.length ||
            currentwin.earlySeven.length
        ) {

            if (currentwin.topLine.length) {
                io.emit('new-winner', { type: "Top line", value: [...new Set(currentwin.topLine)] });
            }
            if (currentwin.middleLine.length) {
                io.emit('new-winner', { type: "Middle line", value: [...new Set(currentwin.middleLine)] });
            }
            if (currentwin.bottomLine.length) {
                io.emit('new-winner', { type: "Bottom line", value: [...new Set(currentwin.bottomLine)] });
            }
            if (currentwin.fourCorners.length) {
                io.emit('new-winner', { type: "Four corners", value: [...new Set(currentwin.fourCorners)] });
            }
            if (currentwin.earlyFive.length) {
                io.emit('new-winner', { type: "Early five", value: [...new Set(currentwin.earlyFive)] });
            }
            if (currentwin.earlySeven.length) {
                io.emit('new-winner', { type: "Early seven", value: [...new Set(currentwin.earlySeven)] });
            }
            if (currentwin.fullHouse.length) {
                io.emit('new-winner', { type: "Full House", value: [...new Set(currentwin.fullHouse)] });
            }

            if (seconds < 5) {
                delay += 4000;
            }
        }

        if (currentwin.fullHouse.length || availableNumbers.length === 0) {
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
