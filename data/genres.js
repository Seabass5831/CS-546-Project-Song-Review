import helpers from "../helpers.js";
import { genres } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
/*
 create => create a new genre => params : [name, description]
  getAll => get all genres
  get => get a genre => params: [id]
  remove => remove a genre => params: [id]
  update => update a genre => params: [id, name, description]*/

const exportedMethods = {
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
};
export default exportedMethods;
