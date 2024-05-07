import { Router } from "express";
import spotifyApi from "../data/spotifyAuth.js";

const router = Router();

router.route("/").get(async (req, res) => {
  const userLoggedIn = !!req.session.userId;
  try {
    const playlistId = "37i9dQZEVXbLRQDuF5jeBp";
    const playlistResponse = await spotifyApi.getPlaylistTracks(playlistId);
    if (playlistResponse.body && playlistResponse.body.items) {
      const songs = playlistResponse.body.items.map(item => ({
        title: item.track.name,
        artist: item.track.artists.map(artist => artist.name).join(", "),
        album: item.track.album.name
      }));
      res.render("songlist", { 
        songs: songs, 
        title: "Top 50 Songs on Spotify", 
        userLoggedIn: userLoggedIn
      });
    } else {
      res.status(404).render("error", { error: "Playlist not found" });
    }
  } catch (error) {
    console.error("Failed to fetch Top 50 playlist:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
});

export default router;
