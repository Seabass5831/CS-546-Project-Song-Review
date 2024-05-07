import { Router } from "express";
import reviewData from "../data/reviews.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const reviews = await reviewData.getAll();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/reviews/:songId', async (req, res) => {
    const songId = req.params.songId; // ID of the song being reviewed
    const userId = req.session.userId; // Assumes user ID is stored in session
    const { text, stars } = req.body; // Review text and star rating from the form
    console.log(songId, userId, text, stars);
  
    if (!userId) {
      return res.status(403).json({ error: "User must be logged in to post reviews" });
  }
  
  try {
      // Validation and processing here
      const newReview = await reviewData.create(songId, userId, text, 'positive', parseInt(stars));
      res.redirect(`/song/${songId}`);
  } catch (error) {
      console.error("Failed to submit review:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
  });

export default router;
