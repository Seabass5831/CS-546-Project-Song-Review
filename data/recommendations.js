import helpers from "../helpers.js";
import { recommendations } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
/*
 create => creates a new recommendation => params : [userId, recommendedSongs]
  remove => removes a recommendation => params: [userId]
  get => get a recommendation => params: [userId]
  update => update a recommendation => params: [userId, recommendedSongs]
  getAll => get all recommendations for a user => params: [userId]
*/

const exportedMethods = {
  async create([userId, recommendedSongs]) {
    try {
      helpers.requiredParams([userId, recommendedSongs]);
      userId = helpers.checkId(userId, "userId");
      recommendedSongs = helpers.checkStringArray(
        recommendedSongs,
        "recommendedSongs",
      );
      const recommendation = {
        userId,
        recommendedSongs,
      };
      const recommendationCollection = await recommendations();
      const newRecommendation =
        await recommendationCollection.insertOne(recommendation);
      newRecommendation._id = newRecommendation.insertedId.toString();
      return newRecommendation;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async remove(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const recommendationCollection = await recommendations();
      const deletionInfo = await recommendationCollection.deleteOne({
        _id: new ObjectId(userId),
      });
      if (deletionInfo.deletedCount === 0) {
        throw new Error(`Could not delete recommendation with id ${userId}`);
      }
      return deletionInfo;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async get(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const recommendationCollection = await recommendations();
      const new_recommendation = await recommendationCollection.findOne({
        _id: new ObjectId(userId),
      });
      return new_recommendation;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async update([userId, recommendedSongs]) {
    try {
      helpers.requiredParams([userId, recommendedSongs]);
      userId = helpers.checkId(userId, "userId");
      recommendedSongs = helpers.checkStringArray(
        recommendedSongs,
        "recommendedSongs",
      );
      const recommendationCollection = await recommendations();
      const recommendation = await recommendationCollection.findOneAndUpdate(
        {
          _id: new ObjectId(userId),
        },
        {
          $set: {
            recommendedSongs: recommendedSongs,
          },
        },
        {
          returnDocument: "after",
        },
      );
      if (!recommendation) {
        throw new Error(`Could not update recommendation with id ${userId}`);
      }
      return recommendation;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async getAll(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const recommendationCollection = await recommendations();
      const ListOfrecommendations = await recommendationCollection
        .find({ userId: userId })
        .toArray();
      return ListOfrecommendations;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
export default exportedMethods;
