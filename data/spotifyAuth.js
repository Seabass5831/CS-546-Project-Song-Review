import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
dotenv.config();
/*
 getAccessToken => get an access token for spotify
  Setup spotify API
  import for use in other files */


// Set up Spotify API credentials
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Retrieve an access token
async function getAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body.access_token;
    spotifyApi.setAccessToken(accessToken);

    return accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

getAccessToken().catch(console.error);

export default spotifyApi;