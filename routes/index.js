import songRoutes from "./songs.js";
import userRoutes from "./users.js";
import songlistRoutes from "./songlist.js";
import reviewRoutes from "./reviews.js";
import { static as staticDir } from "express";

const constructorMethod = (app) => {
  app.use("/", songRoutes);
  app.use("/users", userRoutes);
  app.use("/songlist", songlistRoutes);
  app.use("/reviews", reviewRoutes);
  app.use("/public", staticDir("public"));

  app.use("*", (req, res) => {
    res.status(404).send("404 - Not Found");
  });
};
export default constructorMethod;
