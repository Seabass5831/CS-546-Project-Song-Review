import helpers from "../helpers.js";
import { playlists } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

/*
 create => create a playlist => params : [userId, name, songIds]
  getAll => get all playlists for a user => params: [userId]
  get => get a playlist by id => params: [id]
  remove => remove a playlist by id => params: [id]
  update => update a playlist => params: [id, userId, name, songIds]*/

const exportedMethods = {
  async create([userId, name, songIds]) {
    try {
      helpers.requiredParams([userId, name, songIds]);
      userId = helpers.checkId(userId, "userId");
      name = helpers.checkString(name, "name");
      songIds = helpers.checkStringArray(songIds, "songIds");
      const playlist = {
        userId,
        name,
        songIds,
      };
      const playlistCollection = await playlists();
      const newPlaylist = await playlistCollection.insertOne(playlist);
      newPlaylist._id = newPlaylist.insertedId.toString();
      return newPlaylist;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async getAll(userId) {
    try {
      helpers.requiredParams([userId]);
      userId = helpers.checkId(userId, "userId");
      const playlistCollection = await playlists();
      const ListOfplaylists = await playlistCollection
        .find({ userId: userId })
        .toArray();
      return ListOfplaylists;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async get(id) {
    try {
      helpers.requiredParams([id]);
      id = helpers.checkId(id, "id");
      const playlistCollection = await playlists();
      const playlist = await playlistCollection.findOne({
        _id: new ObjectId(id),
      });
      return playlist;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async remove(id) {
    try {
      helpers.requiredParams([id]);
      id = helpers.checkId(id, "id");
      const playlistCollection = await playlists();
      const deletionInfo = await playlistCollection.deleteOne({
        _id: new ObjectId(id),
      });
      if (deletionInfo.deletedCount === 0) {
        throw new Error(`Could not delete playlist with id ${id}`);
      }
      return deletionInfo;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async update([id, name, songIds]) {
    try {
      helpers.requiredParams([id, name, songIds]);
      id = helpers.checkId(id, "id");
      name = helpers.checkString(name, "name");
      songIds = helpers.checkStringArray(songIds, "songIds");
      const playlistCollection = await playlists();
      const playlist = await playlistCollection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            name: name,
            songIds: songIds,
          },
        },
        {
          returnDocument: "after",
        },
      );
      if (!playlist) {
        throw new Error(`Could not update playlist with id ${id}`);
      }
      return playlist;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};
export default exportedMethods;
