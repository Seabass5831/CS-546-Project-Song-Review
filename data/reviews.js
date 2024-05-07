import helpers from "../helpers.js";
import spotifyApi from "./spotifyAuth.js";
import { reviews, songs, users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb"


const exportedMethods = {
  /**
   * Creates a new review.
   *
   * @param {string} songId - The ID of the song.
   * @param {string} userId - The ID of the user.
   * @param {string} text - The review text.
   * @param {string} sentiment - The sentiment of the review.
   * @param {number} stars - The number of stars given in the review.
   * @returns {Promise<Object>} The newly created review.
   */
  async create(songId, userId, text, sentiment, stars) {
    try {
      // type checking
      helpers.requiredParams([songId, userId, text, sentiment, stars]);
      console.log("songId create: ", songId);
      //songId = id.songId;
      //songId = helpers.checkId(songId, "songId");
      //make sure its in the database?
      const songCollection = await songs();
      const song = await songCollection.findOne({ _id: new ObjectId(songId) });
      if (!song) {
        throw new Error(`Could not find song with id ${songId}`);
      }

      userId = helpers.checkId(userId, "userId");
      //make sure its in the database?
      const userCollection = await users();
      const user = await userCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        throw new Error(`Could not find user with id ${userId}`);
      }

      text = helpers.checkString(text, "text");
      sentiment = helpers.checkString(sentiment, "sentiment");
      let postedDate = new Date();
      postedDate = helpers.convertDate(postedDate);
      if (!helpers.isValidDateFormat(postedDate))
        throw new Error("Invalid Date");

      stars = helpers.checkNumber(stars, "stars");
      //adding review
      const review = {
        songId,
        userId,
        text,
        sentiment,
        stars,
        postedDate,
      };
      const reviewCollection = await reviews();
      const newReview = await reviewCollection.insertOne(review);
      console.log("review created: ", newReview);

      const reviewId = newReview.insertedId;
      const updateResult = await songCollection.updateOne(
        { _id: new ObjectId(songId) },
        { $push: { reviews: reviewId } }
      );
      if (updateResult.modifiedCount === 0) {
        throw new Error("Could not update song with review");
      }
      return newReview;
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Removes a review by its ID.
   *
   * @param {string} reviewId - The ID of the review to be removed.
   * @returns {Promise<Object>} The result of the removal operation.
   */
  async remove(reviewId) {
    try {
      //removes review by id
      helpers.requiredParams([reviewId]);
      reviewId = helpers.checkId(reviewId, "reviewId");
      const reviewCollection = await reviews();
      const removeReview = await reviewCollection.deleteOne({
        _id: new ObjectId(reviewId),
      });
      if (removeReview.deletedCount === 0) {
        throw new Error(`Could not delete song with id ${reviewId}`);
      }
      return removeReview;
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Retrieves a review by its ID.
   *
   * @param {string} reviewId - The ID of the review to be retrieved.
   * @returns {Promise<Object>} The retrieved review.
   */
  async get(reviewId) {
    try {
      //get single review by id
      helpers.requiredParams([reviewId]);
      reviewId = helpers.checkId(reviewId, "reviewId");
      const reviewCollection = await reviews();
      const review = await reviewCollection.findOne({
        _id: new ObjectId(reviewId),
      });
      return review;
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Retrieves all reviews for a given song.
   *
   * @param {string} id - The ID of the song.
   * @returns {Promise<Array>} An array of reviews for the song.
   */
  async getAll(id) {
    //get all reivews for a song.
    //console.log("id: ", id)
    const reviewCollection = await reviews();
    const songCollection = await songs();
    try {
      helpers.requiredParams([id]);
      const songId = id.songId;
      //console.log("extracted id: ", songId);

      
      const song = await songCollection.findOne({ _id: new ObjectId(songId) });
      if (!song) throw new Error("song not found");

      const reviews = await Promise.all(
        song.reviews.map(reviewId =>
          reviewCollection.findOne({ _id: new ObjectId(reviewId) })
        )
      );
      return reviews.filter(review => review !== null);
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Updates a review with new information.
   *
   * @param {string} reviewId - The ID of the review to be updated.
   * @param {string} text - The new review text.
   * @param {string} sentiment - The new sentiment of the review.
   * @param {number} stars - The new number of stars given in the review.
   * @param {string} postedDate - The new posted date of the review.
   * @returns {Promise<Object>} The updated review.
   */
  async update(reviewId, text, sentiment, stars, postedDate) {
    //only updates text and sentiment
    try {
      helpers.requiredParams([reviewId, text, sentiment, stars, postedDate]);
      reviewId = helpers.checkId(reviewId, "reviewId");
      const reviewCollection = await reviews();
      const review = await reviewCollection.findOne({
        _id: new ObjectId(reviewId),
      });
      if (!review) {
        throw new Error(`could not find review with id ${reviewId}`);
      }
      const updateInfo = await reviewCollection.findOneAndUpdate(
        { _id: new ObjectId(reviewId) },
        {
          $set: {
            text: text,
            sentiment: sentiment,
            stars: stars,
            postedDate: postedDate,
          },
        },
        { returnDocument: "after" },
      );
      if (!updateInfo) {
        throw new Error("Could not update review");
      }
      updateInfo._id = updateInfo._id.toString();
      return updateInfo;
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Retrieves all reviews written by a given user.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} An array of reviews written by the user.
   */
  async getAllByUser(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const reviewCollection = await reviews();
      const userReviews = await reviewCollection.find({ userId }).toArray();
      return userReviews;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Retrieves all reviews with a given sentiment.
   *
   * @param {string} sentiment - The sentiment to filter reviews by.
   * @returns {Promise<Array>} An array of reviews with the specified sentiment.
   */
  async getAllBySentiment(sentiment) {
    try {
      helpers.requiredParams([sentiment]);
      sentiment = helpers.checkString(sentiment, "sentiment");
      const reviewCollection = await reviews();
      const sentimentReviews = await reviewCollection.find({ sentiment }).toArray();
      return sentimentReviews;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /** 
  * @param {string} spotifyId - The ID of the song.
  * @returns {Promise<Object>} The newly created review.
  */
  async getIdBySpotifyId(spotifyId) {
    try {
      const songCollection = await songs();
      const song = await songCollection.findOne({ spotifyId: spotifyId });
      if (!song) {
        throw new Error(`Could not find song with spotifyId ${spotifyId}`);
      }
      song._id = song._id;
      return song._id;
    } catch (e) {
      console.error("Error with translation: ", e);
    }
  }
};

export default exportedMethods;
