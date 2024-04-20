import helpers from "../helpers.js";
import bcrypt from "bcrypt";
import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
/*
 create => creates a new user => params : [firstName, lastName, email, password, listendSongs, reviewsPosted]
  remove => removes a user => params : [email]
  get => get a user by email => params : [email]
  getAll => get all users
  update => update a user => params : [userId, firstName, lastName, email, password, listendSongs, reviewsPosted]
  */
const exportedMethods = {
  async create([
    firstName,
    lastName,
    email,
    password,
    listendSongs,
    reviewsPosted,
  ]) {
    try {
      helpers.requiredParams([firstName, lastName, email, password]);
      firstName = helpers.checkString(firstName, "firstname");
      lastName = helpers.checkString(lastName, "lastname");
      email = helpers.checkString(email, "email");
      if (!helpers.isValidEmail(email)) {
        throw new Error("not a valid email");
      }
      password = helpers.checkString(password, "password");
      const listendSongs = [];
      const reviewsPosted = [];

      //handle password logic
      const saltRounds = 16;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      const firstNameHash = await bcrypt.hash(firstName, salt);
      const lastNameHash = await bcrypt.hash(lastName, salt);
      const user = {
        firstName: firstNameHash,
        lastName: lastNameHash,
        email: email,
        password: hash,
        listendSongs,
        reviewsPosted,
      };
      const userCollection = await users();
      const newUser = await userCollection.insertOne(user);
      newUser._id = newUser.insertedId.toString();
      return newUser;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async remove(userId) {
    try {
      console.log(userId);
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const userCollection = await users();
      const deletionInfo = await userCollection.deleteOne({
        _id: new ObjectId(userId),
      });
      if (deletionInfo.deletedCount === 0) {
        throw new Error(`Could not delete user with id ${userId}`);
      }
      return deletionInfo;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async getUserById(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const userCollection = await users();
      const user = await userCollection.findOne({
        _id: new ObjectId(userId),
      });
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async getUserByEmail(email) {
    try {
      helpers.requiredParams([email]);
      email = helpers.checkString(email, "email");
      const userCollection = await users();
      const user = await userCollection.findOne({ email: email });
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async update(
    userId,
    firstName,
    lastName,
    email,
    password,
    listendSongs,
    reviewsPosted,
  ) {
    // updates user info including reviews, but does not require reviews or songs to be updated.
    try {
      helpers.requiredParams([userId, firstName, lastName, email, password]);
      userId = helpers.checkId(userId, "userId");
      firstName = helpers.checkString(firstName, "firstName");
      lastName = helpers.checkString(lastName, "lastName");
      email = helpers.checkString(email, "email");
      if (!helpers.isValidEmail(email)) {
        throw new Error("not a valid email");
      }
      password = helpers.checkString(password, "password");
      const saltRounds = 16;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      const emailHash = await bcrypt.hash(email, salt);
      const firstNameHash = await bcrypt.hash(firstName, salt);
      const lastNameHash = await bcrypt.hash(lastName, salt);

      if (listendSongs === undefined) {
        listendSongs = [];
      }
      if (reviewsPosted === undefined) {
        reviewsPosted = [];
      }

      const userCollection = await users();
      const updateInfo = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            firstName: firstNameHash,
            lastName: lastNameHash,
            email: emailHash,
            password: hash,
            listendSongs: listendSongs,
            reviewsPosted: reviewsPosted,
          },
        },
        { returnDocument: "after" },
      );
      if (!updateInfo) {
        throw new Error("Could not update user");
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
