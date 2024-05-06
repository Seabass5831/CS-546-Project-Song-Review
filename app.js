import express from "express";
import configRoutes from "./routes/index.js";
import exphbs from "express-handlebars";
import helmet from "helmet";
import session from 'express-session';
import { closeConnection, dbConnection } from "./config/mongoConnection.js";
import * as songData from "./data/songs.js";
import spotifyApi from "./data/spotifyAuth.js";

const app = express();

// Use Helmet for setting up security headers
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"], // For jQuery, Bootstrap, etc...
          objectSrc: ["'none'"], // Disallow plugins (like Flash)
          upgradeInsecureRequests: [], // Automatically upgrade HTTP requests to HTTPS
      }
  })
);

app.use(session({
  secret: 'super_secret_key_41',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});

const db = await dbConnection();
await db.dropDatabase();
