import { Router } from "express";
import songData from "../data/songs.js";
import helpers from "../helpers.js";
import { songs } from "../config/mongoCollections.js";
import spotifyApi from "../data/spotifyAuth.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    res.render("home", { title: "Song finder" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.route("/search").post(async (req, res) => {
  try {
    const songName = req.body.search;
    const song = await songData.getSongByName(songName);
    const songList = song.body.tracks.items;
    res.render("songSearchResults", {
      title: "Song finder",
      songList: songList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.route("/song/check/").get(async (req, res) => {
  const { name, artist } = req.query;

  try {
    const songCollection = await songs();
    const song = await songCollection.findOne({ name: name, artist: artist });
    if (song) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Failed to check song existence: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

router.route("/song/create").post(async (req, res) => {
  const { spotifyId, title } = req.body;

  try {
    // Fetch additional song details from Spotify
    const spotifySongResponse = await spotifyApi.getTrack(spotifyId);
    const spotifySong = spotifySongResponse.body;

    if (!spotifySong) {
      return res.status(404).json({ error: "Song not found on Spotify" });
    }

    const newSongDetails = {
      spotifyId: spotifyId,
      title: title || spotifySong.name, 
      artist: spotifySong.artists.map(a => a.name),  
      album: spotifySong.album.name,
      releaseDate: spotifySong.album.release_date,
      genre: spotifySong.artists[0].genres || []
    };

    // Check if the song already exists in the database
    const songCollection = await songs();
    const existingSong = await songCollection.findOne({ spotifyId: spotifyId });
    if (existingSong) {
      return res.status(409).json({ error: "Song already exists in the database." });
    }

    const insertResult = await songCollection.insertOne(newSongDetails);
    if (!insertResult.acknowledged) {
      throw new Error("Failed to insert the song.");
    }
    res.status(201).json({ success: true, songId: insertResult.insertedId.toString() });
  } catch (error) {
    console.error("Failed to create song: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/song/get").get(async (req, res) => {
  try {
    const songs = await songData.getAll();
    return res.json(songs);
  } catch {
    res.status(500).json({ error: e });
  }
});

router.route("/song/:spotifyId").get(async (req, res) => {
  const spotifyId = req.params.spotifyId;

  try {
    // try to find the song in the database by Spotify ID
    let song = await songData.getSongBySpotifyId(spotifyId);

    if (!song) {
      // song not found in the database, fetch from Spotify
      const spotifySong = await spotifyApi.getTrack(spotifyId);
      if (!spotifySong) {
        return res.status(404).render('error', { error: "Song not found on Spotify" });
      }

      // insert song into database
      const newSongDetails = {
        title: spotifySong.body.name,
        artist: spotifySong.body.artists.map(a => a.name).join(", "),
        album: spotifySong.body.album.name,
        releaseDate: spotifySong.body.release_date,
        genre: spotifySong.body.genres.join(", "),
        spotifyId: spotifyId
      };

      song = await songData.create(newSongDetails);
    }

    res.render("songDetails", {
      title: song.title,
      artist: song.artist,
      album: song.album,
      releaseDate: song.releaseDate,
      genre: song.genre
    });
  } catch (error) {
    console.error("Failed to process song details: ", error);
    res.status(500).render('error', { error: "Internal Server Error" });
  }
});

export default router;
