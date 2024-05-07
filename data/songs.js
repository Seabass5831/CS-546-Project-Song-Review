import helpers from "../helpers.js";
import spotifyApi from "./spotifyAuth.js";
import { ObjectId } from "mongodb";
import { songs } from "../config/mongoCollections.js";
import SpotifyWebApi from "spotify-web-api-node";

const exportedMethods = {
  /**
   * Get a song by name.
   * @param {string} songName - The name of the song.
   * @returns {Promise<Object>} The song object.
   */
  async getSongByName(songName) {
    try {
      const song = await spotifyApi.search(songName, ["track"], {
        limit: 5,
        offset: 1,
      });
      return song;
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Get the genre seeds (list of all genres).
   * @returns {Promise<Array>} The list of genre seeds.
   */
  async getGenreSeeds() {
    try {
      const seeds = await spotifyApi.getAvailableGenreSeeds();
      return seeds;
    } catch (err) {
      console.log(err);
    }
  },

  async getSongBySpotifyId(spotifyId) {
    const songCollection = await songs();
    const song = await songCollection.findOne({ spotifyId: spotifyId});
    return song;
  },
  /**
   * Get the genre by artist.
   * @param {string} artist - The name of the artist.
   * @returns {Promise<Object>} The genre object.
   */
  async getGenreByArtist(artist) {
    try {
      const search = await spotifyApi.searchArtists(artist);
      return search;
    } catch (err) {
      console.log(err);
    }
  },

  //DATABASE ACCESS METHODS
  /**
   * Get all songs from the database.
   * @returns {Promise<Array>} The list of songs.
   */
  async getAll() {
    const songsCollection = await songs();
    const song = await songsCollection
      .find({})
      .project({ _id: 1, title: 1 })
      .toArray();
    return song;
  },

  /**
   * Get a song by ID.
   * @param {string} id - The ID of the song.
   * @returns {Promise<Object>} The song object.
   */
  async getSongById(id) {
    id = helpers.checkId(id, "id");
    const songsCollection = await songs();
    const song = await songsCollection.findOne({ _id: new ObjectId(id) });
    if (!song || song === null) {
      throw new Error(`could not find product with id ${id}`);
    }
    song._id = song._id.toString();
    return song;
  },

  /**
   * Create a new song.
   * @param {Array} params - The parameters for creating a song: [title, artist, album, releaseDate, genre].
   * @returns {Promise<Object>} The newly created song object.
   */
  async create([title, artist, album, releaseDate, genre]) {
    try {
      // input parsing / type checking
      helpers.requiredParams([title, artist, album, releaseDate, genre]);
      title = helpers.checkString(title, "title");
      artist = helpers.checkString(artist, "artist");
      album = helpers.checkString(album, "album");
      releaseDate = helpers.checkString(releaseDate, "releaseDate");
      if (!helpers.isValidDateFormat(releaseDate))
        throw new Error("Invalid Date");
      for (let i = 0; i < genre.length; i++) {
        genre[i] = helpers.checkString(genre[i], "genre");
      }
      const song = {
        title,
        artist,
        album,
        releaseDate,
        genre,
        reviews: [],
      };
      const songCollection = await songs();
      //check if already in the database
      const existingSong = await songCollection.findOne({ title, artist });
      // If the song already exists, throw an error or handle as desired
      if (existingSong) {
        throw new Error("Song already exists in the database.");
      }
      const newSong = await songCollection.insertOne(song);
      newSong._id = newSong.insertedId.toString();
      return newSong;
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Remove a song by ID.
   * @param {string} songId - The ID of the song to remove.
   * @returns {Promise<Object>} The deletion information.
   */
  async remove(songId) {
    try {
      helpers.requiredParams([songId]);
      songId = helpers.checkId(songId, "songId");
      const songCollection = await songs();
      const deletionInfo = await songCollection.deleteOne({
        _id: new ObjectId(songId),
      });
      if (deletionInfo.deletedCount === 0) {
        throw new Error(`Could not delete song with id ${songId}`);
      }
      return deletionInfo;
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * Update a song by ID.
   * @param {Array} params - The parameters for updating a song: [songId, title, artist, album, releaseDate, genre].
   * @returns {Promise<Object>} The updated song object.
   */
  async update([songId, title, artist, album, releaseDate, genre]) {
    try {
      helpers.requiredParams([
        songId,
        title,
        artist,
        album,
        releaseDate,
        genre,
      ]);
      title = helpers.checkString(title, "title");
      artist = helpers.checkString(artist, "artist");
      album = helpers.checkString(album, "album");
      releaseDate = helpers.checkString(releaseDate, "releaseDate");
      if (!helpers.isValidDateFormat(releaseDate))
        throw new Error("Invalid Date");

      genre = helpers.checkStringArray(genre, "genre");
      const songCollection = await songs();
      const song = await songCollection.findOne({
        _id: new ObjectId(songId),
      });
      if (!song) {
        throw new Error(`Cloud not find product with id ${songId}`);
      }
      const updateInfo = await songCollection.findOneAndUpdate(
        { _id: new ObjectId(songId) },
        {
          $set: {
            title: title,
            artist: artist,
            album: album,
            releaseDate: releaseDate,
            genre: genre,
          },
        },
        { returnDocument: "after" },
      );
      if (!updateInfo) {
        throw new Error("Could not update song");
      }
      updateInfo._id = updateInfo._id.toString();
      return updateInfo;
    } catch (err) {
      console.log(err);
    }
  },
};

export default exportedMethods;
