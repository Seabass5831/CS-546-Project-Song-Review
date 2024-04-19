import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

// Note: You will need to change the code below to have the collection required by the assignment!
export const songs = getCollectionFn("songs");
export const users = getCollectionFn("users");
export const reviews = getCollectionFn("reviews");
export const comments = getCollectionFn("comments");
export const genres = getCollectionFn("genres");
export const playlists = getCollectionFn("playlists");
export const recommendations = getCollectionFn("recommendations");