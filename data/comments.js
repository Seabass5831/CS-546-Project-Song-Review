import helpers from "../helpers.js";
import { comments } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
/*
 exportedMethods
  create => create a new comment => params: [reviewId, userId, content, postedDate]
  remove => remove a comment => params: [commentId]
  get => get a comment => params: [commentId]
  getAll => get all comments for a review => params: [reviewId]
  update => update a comment => params: [commentId, reviewId, userId, content, postedDate]*/

const exportedMethods = {
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
  async getAll(reviewId) {
    try {
      helpers.requiredParams([reviewId]);
      reviewId = helpers.checkId(reviewId, "reviewId");
      const commentCollection = await comments();
      const ListOfcomments = await commentCollection
        .find({ reviewId: reviewId })
        .toArray();
      return ListOfcomments;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async update([commentId, reviewId, userId, content, postedDate]) {
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
};
export default exportedMethods;
