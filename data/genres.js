import helpers from "../helpers.js";
import { genres } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";


const exportedMethods = {
  /**
   * Creates a new genre.
   * @param {string} name - The name of the genre.
   * @param {string} description - The description of the genre.
   * @returns {Promise<Genre>} The newly created genre.
   * @throws {Error} If the required parameters are missing or invalid.
   */
  async create([name, description]) {
    try {
      helpers.requiredParams([name, description]);
      name = helpers.checkString(name, "name");
      description = helpers.checkString(description, "description");
      const genre = {
        name,
        description,
      };
      const genreCollection = await genres();
      const newGenre = await genreCollection.insertOne(genre);
      newGenre._id = newGenre.insertedId.toString();
      return newGenre;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Retrieves all genres.
   * @returns {Promise<Genre[]>} An array of all genres.
   * @throws {Error} If an error occurs while retrieving the genres.
   */
  async getAll() {
    try {
      const genreCollection = await genres();
      const ListOfgenres = await genreCollection.find({}).toArray();
      return ListOfgenres;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Retrieves a genre by its id.
   * @param {string} id - The id of the genre.
   * @returns {Promise<Genre>} The genre with the specified id.
   * @throws {Error} If the required parameter is missing or invalid.
   */
  async get(id) {
    try {
      helpers.requiredParams([id]);
      id = helpers.checkId(id, "id");
      const genreCollection = await genres();
      const get_genre = await genreCollection.findOne({
        _id: new ObjectId(id),
      });
      return get_genre;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Removes a genre by its id.
   * @param {string} id - The id of the genre to remove.
   * @returns {Promise<DeletionInfo>} The deletion information.
   * @throws {Error} If the required parameter is missing or if the genre cannot be deleted.
   */
  async remove(id) {
    try {
      helpers.requiredParams([id]);
      id = helpers.checkId(id, "id");
      const genreCollection = await genres();
      const deletionInfo = await genreCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (deletionInfo.deletedCount === 0) {
        throw new Error(`Could not delete genre with id ${id}`);
      }
      return deletionInfo;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Updates a genre by its id.
   * @param {string} id - The id of the genre to update.
   * @param {string} name - The new name of the genre.
   * @param {string} description - The new description of the genre.
   * @returns {Promise<Genre>} The updated genre.
   * @throws {Error} If the required parameters are missing or if the genre cannot be updated.
   */
  async update([id, name, description]) {
    try {
      helpers.requiredParams([id, name, description]);
      id = helpers.checkId(id, "id");
      name = helpers.checkString(name, "name");
      description = helpers.checkString(description, "description");
      const genreCollection = await genres();
      const genre = await genreCollection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            name: name,
            description: description,
          },
        },
        {
          returnDocument: "after",
        },
      );
      if (!genre) {
        throw new Error(`Could not update genre with id ${id}`);
      }
      return genre;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Retrieves a genre by its name.
   * @param {string} name - The name of the genre.
   * @returns {Promise<Genre>} The genre with the specified name.
   * @throws {Error} If the required parameter is missing or if the genre cannot be found.
   */
  async getByName(name) {
    try {
      helpers.requiredParams([name]);
      name = helpers.checkString(name, "name");
      const genreCollection = await genres();
      const genre = await genreCollection.findOne({ name: name });
      if (!genre) {
        throw new Error(`Could not find genre with name ${name}`);
      }
      return genre;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Searches for genres by keyword.
   * @param {string} keyword - The keyword to search for.
   * @returns {Promise<Genre[]>} An array of genres matching the keyword.
   * @throws {Error} If the required parameter is missing or if an error occurs during the search.
   */
  async search(keyword) {
    try {
      helpers.requiredParams([keyword]);
      keyword = helpers.checkString(keyword, "keyword");
      const genreCollection = await genres();
      const genres = await genreCollection.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ]
      }).toArray();
      return genres;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};

export default exportedMethods;
