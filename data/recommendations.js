import helpers from "../helpers.js";
import { recommendations } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const exportedMethods = {
  /**
   * Creates a new recommendation.
   * @param {string} userId - The ID of the user.
   * @param {string[]} recommendedSongs - The array of recommended songs.
   * @returns {Promise<Recommendation>} The newly created recommendation.
   * @throws {Error} If any of the required parameters are missing or invalid.
   */
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

  /**
   * Removes a recommendation.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<DeletionInfo>} The deletion information.
   * @throws {Error} If the recommendation with the specified user ID cannot be found.
   */
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

  /**
   * Retrieves a recommendation by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Recommendation>} The recommendation.
   * @throws {Error} If the recommendation with the specified user ID cannot be found.
   */
  async get(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const recommendationCollection = await recommendations();
      const recommendation = await recommendationCollection.findOne({
        _id: new ObjectId(userId),
      });
      return recommendation;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Updates a recommendation by user ID.
   * @param {string} userId - The ID of the user.
   * @param {string[]} recommendedSongs - The array of recommended songs.
   * @returns {Promise<Recommendation>} The updated recommendation.
   * @throws {Error} If any of the required parameters are missing or invalid,
   * or if the recommendation with the specified user ID cannot be found.
   */
  async update(userId, recommendedSongs) {
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

  /**
   * Retrieves all recommendations for a user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Recommendation[]>} The list of recommendations.
   * @throws {Error} If the user with the specified ID cannot be found.
   */
  async getAll(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const recommendationCollection = await recommendations();
      const listOfrecommendations = await recommendationCollection
        .find({ userId: userId })
        .toArray();
      return listOfrecommendations;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Adds a song to a recommendation.
   * @param {string} recommendationId - The ID of the recommendation.
   * @param {string} songId - The ID of the song.
   * @returns {Promise<Recommendation>} The updated recommendation.
   * @throws {Error} If any of the required parameters are missing or invalid,
   * or if the recommendation with the specified ID cannot be found.
   */
  async addSong(recommendationId, songId) {
    try {
      helpers.requiredParams([recommendationId, songId]);
      recommendationId = helpers.checkId(recommendationId, "recommendationId");
      songId = helpers.checkId(songId, "songId");
      const recommendationCollection = await recommendations();
      const updateInfo = await recommendationCollection.updateOne(
        { _id: recommendationId },
        { $push: { recommendedSongs: songId } }
      );
      if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        throw new Error('Update failed');
      return await this.get(recommendationId);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Removes a song from a recommendation.
   * @param {string} recommendationId - The ID of the recommendation.
   * @param {string} songId - The ID of the song.
   * @returns {Promise<Recommendation>} The updated recommendation.
   * @throws {Error} If any of the required parameters are missing or invalid,
   * or if the recommendation with the specified ID cannot be found.
   */
  async removeSong(recommendationId, songId) {
    try {
      helpers.requiredParams([recommendationId, songId]);
      recommendationId = helpers.checkId(recommendationId, "recommendationId");
      songId = helpers.checkId(songId, "songId");
      const recommendationCollection = await recommendations();
      const updateInfo = await recommendationCollection.updateOne(
        { _id: recommendationId },
        { $pull: { recommendedSongs: songId } }
      );
      if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        throw new Error('Update failed');
      return await this.get(recommendationId);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};

export default exportedMethods;
