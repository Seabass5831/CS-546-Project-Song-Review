
import helpers from "../helpers.js";
import bcrypt from "bcrypt";
import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";


const exportedMethods = {

  /**
   * Creates a new user.
   * @async
   * @param {Object} user - The user object containing user information.
   * @param {string} user.username = The username of the user.
   * @param {string} user.firstName - The first name of the user.
   * @param {string} user.lastName - The last name of the user.
   * @param {string} user.email - The email address of the user.
   * @param {string} user.password - The password of the user.
   * @param {Array} user.favoriteGenres - The favorite genres of the user.
   * @returns {Promise<Object>} The newly created user object.
   * @throws {Error} If any required parameter is missing or invalid.
   */
  async create([username, firstName, lastName, email, password, favoriteGenres]) {
    console.log(username, firstName, lastName, email, password, favoriteGenres);
    try {
      helpers.requiredParams([username, firstName, lastName, email, password]);
      username = helpers.checkString(username, "username");
      firstName = helpers.checkString(firstName, "firstname");
      lastName = helpers.checkString(lastName, "lastname");
      email = helpers.checkString(email, "email");
      if (!helpers.isValidEmail(email)) {
        throw new Error("not a valid email");
      }
      password = helpers.checkString(password, "password");
      favoriteGenres = helpers.checkStringArray(favoriteGenres, "favoriteGenres");

      const userCollection = await users();
      const existingUser = await userCollection.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        throw new Error("User already exists");
      }

      //handle password logic
      const saltRounds = 16;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);

      const user = {
        username,
        firstName,
        lastName,
        email,
        hashedPassword: hash,
        favoriteGenres,
        listenedSongs: [],
        reviewsPosted: [],
        friends: [],
      };

      const newUser = await userCollection.insertOne(user);
      newUser._id = newUser.insertedId.toString();
      return newUser;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Retrieves all users.
   * @async
   * @returns {Promise<Array>} An array of all user objects.
   * @throws {Error} If an error occurs while retrieving the users.
   */
  async getAllUsers() {
    try {
      const userCollection = await users();
      return await userCollection.find({}).toArray();
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Removes a user by their ID.
   * @async
   * @param {string} userId - The ID of the user to be removed.
   * @returns {Promise<Object>} The deletion information.
   * @throws {Error} If the user with the specified ID does not exist.
   */
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

  /**
   * Retrieves a user by their ID.
   * @async
   * @param {string} userId - The ID of the user to be retrieved.
   * @returns {Promise<Object>} The user object.
   * @throws {Error} If the user with the specified ID does not exist.
   */
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

  /**
   * Retrieves a user by their email address.
   * @async
   * @param {string} email - The email address of the user to be retrieved.
   * @returns {Promise<Object>} The user object.
   * @throws {Error} If the user with the specified email address does not exist.
   */
  async getUserByEmail(email) {
    try {
      helpers.requiredParams([email]);
      email = helpers.checkString(email, "email");
      const userCollection = await users();
      const user = await userCollection.findOne({ email });
      if (!user) throw new Error(`Could not find user with email ${email}`);
      return user;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },


  /**
   * Validates a user's password.
   * @async
   * @param {string} userId - The ID of the user.
   * @param {string} password - The password to be validated.
   * @returns {Promise<boolean>} A boolean indicating whether the password is valid.
   * @throws {Error} If any required parameter is missing or invalid.
   */
  async validatePassword(userId, password) {
    try {
      helpers.requiredParams([userId, password]);
      if (typeof userId !== 'string') {
        userId = userId.toString();
      }
      userId = helpers.checkId(userId, "userId");
      password = helpers.checkString(password, "password");
      const user = await this.getUserById(userId);
      const match = await bcrypt.compare(password, user.hashedPassword);
      return match;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Updates a user's information.
   * @async
   * @param {string} userId - The ID of the user to be updated.
   * @param {string} firstName - The updated first name of the user.
   * @param {string} lastName - The updated last name of the user.
   * @param {string} email - The updated email address of the user.
   * @param {string} password - The updated password of the user.
   * @param {Array} listendSongs - The updated list of listened songs.
   * @param {Array} reviewsPosted - The updated list of reviews posted by the user.
   * @returns {Promise<Object>} The updated user object.
   * @throws {Error} If any required parameter is missing or invalid.
   */
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

  async getUserByUsername(username) {
    const userCollection = await users();
    return await userCollection.findOne({ username });
  },

  /**
 * Adds a friend to the user's friend list.
 * @param {string} userId - The user's ID who is adding the friend.
 * @param {string} friendUsername - The username of the friend to add.
 * @returns {Promise<Object>} - The result of the update operation.
 */
  async addFriendByUsername(userId, friendUsername) {
    const userCollection = await users();
    const friend = await userCollection.findOne({ username: friendUsername });
    if (!friend) throw new Error("Friend username not found");

    const currentUser = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (currentUser.friends.includes(friend._id.toString())) {
      throw new Error("This user is already your friend");
    }

    if (currentUser.username === friendUsername) {
      throw new Error("You cannot add yourself as a friend");
    }

    return userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { friends: friend._id.toString() } }
    );
  }
};
export default exportedMethods;
