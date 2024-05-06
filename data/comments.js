import helpers from "../helpers.js";
import { comments } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";



const exportedMethods = {
  /**
   * Creates a new comment.
   * @param {string} reviewId - The ID of the review.
   * @param {string} userId - The ID of the user.
   * @param {string} content - The content of the comment.
   * @param {string} postedDate - The date the comment was posted.
   * @returns {Promise<Comment>} The newly created comment.
   * @throws {Error} If any of the required parameters are missing or invalid.
   */
  async create([reviewId, userId, content, postedDate]) {
    try {
      helpers.requiredParams([reviewId, userId, content, postedDate]);
      reviewId = helpers.checkId(reviewId, "reviewId");
      userId = helpers.checkId(userId, "userId");
      content = helpers.checkString(content, "content");
      postedDate = helpers.checkString(postedDate, "postedDate");
      if (!helpers.isValidDateFormat(postedDate)) {
        throw new Error("not a valid date format");
      }
      const comment = {
        reviewId,
        userId,
        content,
        postedDate,
      };
      const commentCollection = await comments();
      const newComment = await commentCollection.insertOne(comment);
      newComment._id = newComment.insertedId.toString();
      return newComment;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Removes a comment.
   * @param {string} commentId - The ID of the comment.
   * @returns {Promise<DeletionInfo>} The deletion information.
   * @throws {Error} If the comment with the specified ID cannot be found.
   */
  async remove(commentId) {
    try {
      helpers.requiredParams([commentId]);
      commentId = helpers.checkId(commentId, "commentId");
      const commentCollection = await comments();
      const deletionInfo = await commentCollection.deleteOne({
        _id: new ObjectId(commentId),
      });
      if (deletionInfo.deletedCount === 0) {
        throw new Error(`Could not delete comment with id ${commentId}`);
      }
      return deletionInfo;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Gets a comment by its ID.
   * @param {string} commentId - The ID of the comment.
   * @returns {Promise<Comment>} The comment.
   * @throws {Error} If the comment with the specified ID cannot be found.
   */
  async get(commentId) {
    try {
      helpers.requiredParams([commentId]);
      commentId = helpers.checkId(commentId, "commentId");
      const commentCollection = await comments();
      const comment = await commentCollection.findOne({
        _id: new ObjectId(commentId),
      });
      return comment;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Gets all comments for a review.
   * @param {string} reviewId - The ID of the review.
   * @returns {Promise<Comment[]>} The list of comments.
   * @throws {Error} If the review with the specified ID cannot be found.
   */
  async getAll(reviewId) {
    try {
      helpers.requiredParams([reviewId]);
      reviewId = helpers.checkId(reviewId, "reviewId");
      const commentCollection = await comments();
      const listOfComments = await commentCollection
        .find({ reviewId: reviewId })
        .toArray();
      return listOfComments;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Updates a comment.
   * @param {string} commentId - The ID of the comment.
   * @param {string} reviewId - The ID of the review.
   * @param {string} userId - The ID of the user.
   * @param {string} content - The content of the comment.
   * @param {string} postedDate - The date the comment was posted.
   * @returns {Promise<Comment>} The updated comment.
   * @throws {Error} If any of the required parameters are missing or invalid,
   * or if the comment with the specified ID cannot be found.
   */
  async update(commentId, reviewId, userId, content, postedDate) {
    try {
      helpers.requiredParams([commentId, userId, content, postedDate]);
      commentId = helpers.checkId(commentId, "commentId");
      reviewId = helpers.checkId(reviewId, "reviewId");
      userId = helpers.checkId(userId, "userId");
      content = helpers.checkString(content, "content");
      postedDate = helpers.checkString(postedDate, "postedDate");
      if (!helpers.isValidDateFormat(postedDate)) {
        throw new Error("not a valid date format");
      }
      const comment = {
        commentId,
        userId,
        content,
        postedDate,
      };
      const commentCollection = await comments();
      const updateInfo = await commentCollection.findOneAndUpdate(
        { _id: new ObjectId(commentId) },
        {
          $set: {
            reviewId: reviewId,
            userId: userId,
            content: content,
            postedDate: postedDate,
          },
        },
        { returnDocument: "after" },
      );
      if (!updateInfo) {
        throw new Error("Could not update comment");
      }
      updateInfo._id = updateInfo._id.toString();
      return updateInfo;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Gets comments by a user.
   * @param {string} userId - The ID of the user.
   * @returns {Array} The list of comments.
   * @throws {Error} If the user with the specified ID cannot be found.
   */
  async getByUser(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const commentCollection = await comments();
      const userComments = await commentCollection.find({ userId: userId }).toArray();
      return userComments;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Gets the most recent comments.
   * @param {number} limit - The maximum number of comments to retrieve.
   * @returns {Array} The list of recent comments.
   * @throws {Error} If the limit is missing or invalid.
   */
  async getRecent(limit) {
    try {
      helpers.requiredParams([limit]);
      limit = helpers.checkNumber(limit, "limit");
      const commentCollection = await comments();
      const recentComments = await commentCollection.find().sort({ postedDate: -1 }).limit(limit).toArray();
      return recentComments;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Gets the count of comments by a user.
   * @param {string} userId - The ID of the user.
   * @returns {number} The count of comments.
   * @throws {Error} If the user with the specified ID cannot be found.
   */
  async getCountByUser(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const commentCollection = await comments();
      const count = await commentCollection.countDocuments({ userId: userId });
      return count;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};

export default exportedMethods;
