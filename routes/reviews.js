import { Router } from "express";
import { ObjectId } from "mongodb";
import reviewData from "../data/reviews.js";

const router = Router();

router.get('/', async (req, res) => {
    console.log("help");
    try {
        const reviews = await reviewData.getAll();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:spotifyId', async (req, res) => {
    const spotifyId = req.params.spotifyId;
    const userLoggedIn = !!req.session.userId;
    let songId = await reviewData.getIdBySpotifyId(spotifyId);

    songId = songId.toString();
    
    try {
        const reviews = await reviewData.getAll({ songId: songId.toString() });
        if (reviews.length > 0) {
            res.render('reviews.handlebars', { 
                reviews: reviews,
                spotifyId: spotifyId,
                title: 'Reviews',
                userLoggedIn: userLoggedIn
            });
        } else {
            res.render('reviews.handlebars', { reviews: [], spotifyId, title: 'No Reviews Found', userLoggedIn: userLoggedIn });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:spotifyId', async (req, res) => {
    const spotifyId = req.params.spotifyId;
    const userId = req.session.userId;
    const { text, stars } = req.body;

    let songId = await reviewData.getIdBySpotifyId(spotifyId);

    if (!userId) {
        return res.status(403).json({ error: "User must be logged in to post reviews" });
    }

    try {
        console.log("Posting Review:", { songId, userId, text, stars });
        const newReview = await reviewData.create(songId, userId, text, 'positive', parseInt(stars));
        if (!newReview) {
            return res.status(500).json({ error: "Failed to add review" });
        }
        res.redirect(`/reviews/${spotifyId}`);
    } catch (error) {
        console.error("Failed to submit review:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
