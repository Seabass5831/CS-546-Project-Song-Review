import helpers from "../helpers.js";
import spotifyApi from "./spotifyAuth.js";
import { reviews, songs, users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
/*
 create => creates a new review => params : [songId, userId, text, sentiment, stars]
  remove => removes a review => params : [reviewId]
  get => get a review by id => params : [reviewId]
  getAll => get all reviews for a song => params : [songId]
  update => update a review => params : [reviewId, text, sentiment, stars]*/
const exportedMethods = {
  async create([songId, userId, text, sentiment, stars]) {
    /*
     */
    try {
      // type checking
      helpers.requiredParams([songId, userId, text, sentiment, stars]);
      songId = helpers.checkId(songId, "songId");
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
      newReview._id = newReview.insertedId.toString();
      return newReview;
    } catch (err) {
      console.log(err);
    }
  },
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
  async getAll(songId) {
    //get all reivews for a song.
    try {
      helpers.requiredParams([songId]);
      songId = helpers.checkId(songId, "songId");
      const reviewCollection = await reviews();
      const ListOfreviews = await reviewCollection
        .find({ songId: songId })
        .toArray();
      return ListOfreviews;
    } catch (err) {
      console.log(err);
    }
  },
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
};

export default exportedMethods;
