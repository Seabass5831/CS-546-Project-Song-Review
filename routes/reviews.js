import { Router } from "express";
import reviewData from "../data/reviews.js";

const router = Router();

router.get('/:songId', async (req, res) => {
    try {
        const songId = req.params.songId;
        const reviews = await reviewData.getAll(songId);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:songId', async (req, res) => {
    const songId = req.params.songId;
    const { userId, text, sentiment, stars } = req.body;

    try {
        const newReview = await reviewData.create(songId, userId, text, sentiment, parseInt(stars));
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
