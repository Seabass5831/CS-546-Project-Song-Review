import { closeConnection, dbConnection } from "./config/mongoConnection.js";
import users from "./data/users.js";
import reviews from "./data/reviews.js";
import comments from "./data/comments.js";
import genres from "./data/genres.js";
import playlists from "./data/playlists.js";
import songs from "./data/songs.js";
import recommendations from "./data/recommendations.js";
//import api and database
const db = await dbConnection();
await db.dropDatabase();
// create some users
let user1, user2, song1, song2, review1, review2;
try {
  user1 = await users.create([
    "username1",
    "drew",
    "warkentin",
    "warkentin@uw.edu",
    "password",
    ["pop", "popular"],

  ]);
  user2 = await users.create(["username2", "mk", "gee", "gee@uw.edu", "different password", ["Soul", "Rock"],]);
} catch (err) {
  console.log(err);
}
// create some songs
try {
  let songList = await songs.getSongByName("Breathe");
  songList = songList.body.tracks.items;
  //get genres
  let genres = await songs.getGenreByArtist(songList[0].artists[0].name);
  genres = genres.body.artists.items[0].genres;
  song1 = await songs.create([
    songList[0].name,
    songList[0].artists[0].name,
    songList[0].album.name,
    songList[0].album.release_date,
    genres,
  ]);
  let genres2 = await songs.getGenreByArtist(songList[1].artists[0].name);
  genres2 = genres2.body.artists.items[0].genres;
  song2 = await songs.create([
    songList[1].name,
    songList[1].artists[0].name,
    songList[1].album.name,
    songList[1].album.release_date,
    genres2,
  ]);
  // const delete_song = await songs.remove(song1._id);
  // console.log(delete_song);
  // const get_song = await songs.getSongById(song2._id);
  // console.log(get_song);
  // const get_all = await songs.getAll();
  // console.log(get_all);
  // const update_song = await songs.update([
  //   song2._id,
  //   "title",
  //   "artist",
  //   "album",
  //   "2022-04-19",
  //   ["genre"],
  // ]);
  // console.log(update_song);
} catch (err) {
  console.log(err);
}
//create some reviews (user and song are required)

try {
  review1 = await reviews.create([
    song1._id,
    user1._id,
    "I like this song",
    "positive",
    3,
  ]);
  review2 = await reviews.create([
    song2._id,
    user1._id,
    "I like this song",
    "positive",
    3,
  ]);
  // const delete_review = await reviews.remove(review1._id);
  // console.log(delete_review);
  // const get_review = await reviews.get(review2._id);
  // console.log(get_review);
  // const get_all = await reviews.getAll(song2._id);
  // console.log(get_all);
  // const update_review = await reviews.update(
  //   review2._id,
  //   "I hate this song",
  //   "negative",
  //   1,
  //   "2022-01-01",
  // );
  // console.log(update_review);
} catch (err) {
  console.log(err);
}
//create some comments
/*
try {
  const comment1 = await comments.create([
    review1._id,
    user1._id,
    "I like this song",
    "2022-01-01",
  ]);
  const comment2 = await comments.create([
    review2._id,
    user1._id,
    "I like this song",
    "2022-01-01",
  ]);

  // const delete_comment = await comments.remove(comment1._id);
  // console.log(delete_comment);
  // const get_comment = await comments.get(comment2._id);
  // console.log(get_comment);
  // const get_all = await comments.getAll(review2._id);
  // console.log(get_all);
  // const update_comment = await comments.update([
  //   comment2._id,
  //   review2._id,
  //   user1._id,
  //   "I hate this song",
  //   "2022-01-01",
  // ]);
  // console.log(update_comment);
} catch (err) {
  console.log(err);
}
*/



//create some genres
try {
  const genre1 = await genres.create(["genre1", "genre1 description"]);
  const genre2 = await genres.create(["genre2", "genre2 description"]);
  // const delete_genre = await genres.remove(genre1._id);
  // console.log(delete_genre);
  // const get_genre = await genres.get(genre2._id);
  // console.log(get_genre);
  // const get_all = await genres.getAll();
  // console.log(get_all);
  // const update_genre = await genres.update([
  //   genre2._id,
  //   "genre2",
  //   "genre2 description",
  // ]);
  // console.log(update_genre);
} catch (err) {
  console.log(err);
}
//create some playlists
try {
  const playlist1 = await playlists.create([
    user1._id,
    "playlist1",
    [song1._id, song2._id],
  ]);
  const playlist2 = await playlists.create([
    user2._id,
    "playlist2",
    [song1._id, song2._id],
  ]);
  // const delete_playlist = await playlists.remove(playlist1._id);
  // console.log(delete_playlist);
  // const get_playlist = await playlists.get(playlist2._id);
  // console.log(get_playlist);
  // const get_all = await playlists.getAll(user2._id);
  // console.log(get_all);
  // const update_playlist = await playlists.update([
  //   playlist2._id,
  //   "playlist2",
  //   [song1._id, song2._id],
  // ]);
  // console.log(update_playlist);
} catch (err) {
  console.log(err);
}
//create some recommendations
try {
  const recommendation1 = await recommendations.create([
    user1._id,
    [song1._id, song2._id],
  ]);
  const recommendation2 = await recommendations.create([
    user2._id,
    [song1._id, song2._id],
  ]);
  // const delete_recommendation = await recommendations.remove(
  //   recommendation1._id,
  // );
  // console.log(delete_recommendation);
  // const get_recommendation = await recommendations.get(recommendation2._id);
  // console.log(get_recommendation);
  // const get_all = await recommendations.getAll(user2._id);
  // console.log(get_all);
  // const update_recommendation = await recommendations.update([
  //   recommendation2._id,
  //   [song1._id, song2._id],
  // ]);
  // console.log(update_recommendation);
} catch (err) {
  console.log(err);
}
console.log("Done seeding database");
