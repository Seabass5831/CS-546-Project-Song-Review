import axios from "axios";
import helpers from "../helpers.js";
import spotifyApi from "./spotifyAuth.js";
import { ObjectId } from "mongodb";
import { songs } from "../config/mongoCollections.js";
/*
 getSongByName => get a song by name => params : [songName]
  getGenreSeeds => get the genre seeds (list of all genres)
  getGenreByArtist => get the genre by artist => params : [artist]
  getAll => get all songs from the database
  getSongById => get a song by id => params : [id]
  create => create a new song => params : [title, artist, album, genres]
  remove => remove a song => params : [id]
  update => update a song => params : [id, title, artist, album, genres]*/
const exportedMethods = {
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
  //list of all genres
  async getGenreSeeds() {
    try {
      const seeds = await spotifyApi.getAvailableGenreSeeds();
      return seeds;
    } catch (err) {
      console.log(err);
    }
  },
  //get genre by artist
  async getGenreByArtist(artist) {
    try {
      const search = await spotifyApi.searchArtists(artist);
      return search;
    } catch (err) {
      console.log(err);
    }
  },

  //DATABASE FUNCTIONS
  async getAll() {
    const songsCollection = await songs();
    const song = await songsCollection
      .find({})
      .project({ _id: 1, title: 1 })
      .toArray();
    return song;
  },

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
  //create the entry into the Song collection
  //general entry to the database if the song is not in there.
  async create([title, artist, album, releaseDate, genre]) {
    /* Requires title artist album releaseDate and Genre, reviewScores is optional and can be
    called when the user creates a review For a song. Need to check for string input
    and need to check array on genre and object on reivewScores */
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
