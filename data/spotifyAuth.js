import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
dotenv.config();
/*
 getAccessToken => get an access token for spotify
  Setup spotify API
  import for use in other files */

dotenv.config({ path: ".env" })

/*  I will update this before the final submission,
    we would all need to have the same .env file in our
    branches

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
*/

const client_id = '6e2899240f2d4830a467092f35b58b00';
const client_secret = 'b9cb2ad1e6764dcba20d6e39b9d3b73a';

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
