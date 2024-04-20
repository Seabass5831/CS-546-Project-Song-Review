import SpotifyWebApi from "spotify-web-api-node";
/*
 getAccessToken => get an access token for spotify
  Setup spotify API
  import for use in other files */

// Set up Spotify API credentials
const spotifyApi = new SpotifyWebApi({
  clientId: "6e2899240f2d4830a467092f35b58b00",
  clientSecret: "b9cb2ad1e6764dcba20d6e39b9d3b73a",
  redirectUri: "https://localhost:3000",
});

// Retrieve an access token
async function getAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body.access_token;
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setCredentials({
      accessToken: accessToken,
    });

    return accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}
await getAccessToken();
export default spotifyApi;
