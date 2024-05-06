import helpers from "../helpers.js";
import { playlists } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";


const exportedMethods = {
  /**
   * Creates a new playlist.
   * @param {string} userId - The ID of the user who owns the playlist.
   * @param {string} name - The name of the playlist.
   * @param {string[]} songIds - An array of song IDs in the playlist.
   * @returns {Promise<PlaylistWithId>} The newly created playlist.
   * @throws {Error} If any required parameter is missing or invalid.
   */
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

  /**
   * Retrieves all playlists for a user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<PlaylistWithId[]>} An array of playlists owned by the user.
   * @throws {Error} If any required parameter is missing or invalid.
   */
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

  /**
   * Retrieves a playlist by its ID.
   * @param {string} id - The ID of the playlist.
   * @returns {Promise<PlaylistWithId>} The playlist with the specified ID.
   * @throws {Error} If any required parameter is missing or invalid.
   */
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

  /**
   * Removes a playlist by its ID.
   * @param {string} id - The ID of the playlist to remove.
   * @returns {Promise<object>} The deletion information.
   * @throws {Error} If any required parameter is missing or invalid, or if the playlist cannot be deleted.
   */
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

  /**
   * Updates a playlist.
   * @param {string} id - The ID of the playlist to update.
   * @param {string} name - The new name of the playlist.
   * @param {string[]} songIds - The new array of song IDs in the playlist.
   * @returns {Promise<PlaylistWithId>} The updated playlist.
   * @throws {Error} If any required parameter is missing or invalid, or if the playlist cannot be updated.
   */
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

  /**
   * Adds a song to a playlist.
   * @param {string} playlistId - The ID of the playlist.
   * @param {string} songId - The ID of the song to add.
   * @returns {Promise<PlaylistWithId>} The updated playlist.
   * @throws {Error} If any required parameter is missing or invalid, or if the song cannot be added to the playlist.
   */
  async addSong(playlistId, songId) {
    try {
      helpers.requiredParams([playlistId, songId]);
      playlistId = helpers.checkId(playlistId, "playlistId");
      songId = helpers.checkId(songId, "songId");
      const playlistCollection = await playlists();
      const updateInfo = await playlistCollection.updateOne(
        { _id: playlistId },
        { $push: { songIds: songId } }
      );
      if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        throw new Error('Update failed');
      return await this.get(playlistId);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  /**
   * Removes a song from a playlist.
   * @param {string} playlistId - The ID of the playlist.
   * @param {string} songId - The ID of the song to remove.
   * @returns {Promise<PlaylistWithId>} The updated playlist.
   * @throws {Error} If any required parameter is missing or invalid, or if the song cannot be removed from the playlist.
   */
  async removeSong(playlistId, songId) {
    try {
      helpers.requiredParams([playlistId, songId]);
      playlistId = helpers.checkId(playlistId, "playlistId");
      songId = helpers.checkId(songId, "songId");
      const playlistCollection = await playlists();
      const updateInfo = await playlistCollection.updateOne(
        { _id: playlistId },
        { $pull: { songIds: songId } }
      );
      if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        throw new Error('Update failed');
      return await this.get(playlistId);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
};

export default exportedMethods;
