import { Router } from "express";
import songData from "../data/songs.js";
import helpers from "../helpers.js";
import { songs } from "../config/mongoCollections.js";
import reviewData from "../data/reviews.js";
import spotifyApi from "../data/spotifyAuth.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    const userLoggedIn = !!req.session.userId;
    res.render("home", { title: "Song finder", userLoggedIn });
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
  const { spotifyId, title, artist } = req.body;

  try {
    const spotifySongResponse = await spotifyApi.getTrack(spotifyId);
    if (!spotifySongResponse.body) {
      return res.status(404).json({ error: "Song not found on Spotify" });
    }

    const spotifySong = spotifySongResponse.body;

    const artistNames = spotifySong.artists.map(a => a.name);
    const artistGenres = new Set();  
    for (const artist of spotifySong.artists) {
      const artistDetails = await spotifyApi.getArtist(artist.id);
      if (artistDetails && artistDetails.body && artistDetails.body.genres) {
        artistDetails.body.genres.forEach(genre => artistGenres.add(genre));
      }
    }

    console.log("Genres fetched:", Array.from(artistGenres));

    const newSongDetails = {
      spotifyId: spotifyId,
      title: title || spotifySong.name,
      artist: artist || artistNames.join(", "),
      album: spotifySong.album.name,
      releaseDate: spotifySong.album.release_date,
      genre: artistGenres.size > 0 ? Array.from(artistGenres).join(", ") : 'Unknown'
    };

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
    const songCollection = await songs();
    let song = await songCollection.findOne({ spotifyId: spotifyId });

    if (!song) {
      const spotifySongResponse = await spotifyApi.getTrack(spotifyId);
      if (!spotifySongResponse || !spotifySongResponse.body) {
        return res.status(404).json({ error: "Song not found on Spotify" });
      }

      const spotifySong = spotifySongResponse.body;

      const newSongDetails = {
        spotifyId: spotifyId,
        title: spotifySong.name,
        artist: spotifySong.artists.map(a => a.name).join(", "),
        album: spotifySong.album.name,
        releaseDate: spotifySong.album.release_date,
        genre: spotifySong.genres ? spotifySong.genres.join(", ") : 'Unknown',
        reviews: [],
      };

      await songCollection.insertOne(newSongDetails);
      song = newSongDetails; 
    }

    const reviews = await reviewData.getAll(song._id.toString());

    res.render("songDetails", {
      title: song.title,
      artist: song.artist,
      album: song.album,
      releaseDate: song.releaseDate,
      genre: song.genre,
      reviews: reviews,
    });
  } catch (error) {
    console.error("Failed to process song details: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
