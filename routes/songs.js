import { Router } from "express";
import songData from "../data/songs.js";
import helpers from "../helpers.js";

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
    const artist = songList[0].artists[0].name;
    console.log(artist);
    const artistGenre = await songData.getGenreByArtist(artist);
    const genres = artistGenre.body.artists.items[0].genres;
    console.log(genres);
    res.render("songSearchResults", {
      title: "Song finder",
      songList: songList,
      genres: genres,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.route("/song/create").post(async (req, res) => {
  try {
    let { title, artist, album, releaseDate, genre } = req.body;
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
    const newSong = await songData.create([
      title,
      artist,
      album,
      releaseDate,
      genre,
    ]);
    if (!newSong) {
      throw new Error("Song already in the database");
    }
    res.status(201).json({ message: "Song created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

router.route("/song/:songId").get(async (req, res) => {
  try {
    req.params.songId = helpers.checkId(req.params.songId, "songId");
    const song = await songData.getSongById(req.params.songId);

    if(!song || song === null) {
      res.status(404).json({error: "Song not found"});
      return;
    }
    res.status(200).json(song);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
});

export default router;
