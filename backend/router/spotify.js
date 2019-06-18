const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const spotify_router = express.Router();

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientID: "81142cfcbf1d46e0914d306bbe0c64d7",
    clientSecret: "2e5ebb14833949b6a88786acd6867237",
    callbackURL: 'http://localhost:3001/auth/spotify/callback'
});

spotify_router.post('/setToken', (req, res) => {
    console.log(req.body);
    const { access_token } = req.body;
    console.log("set access token:", access_token);
    spotifyApi.setAccessToken(access_token);
})

// this is our get method
// this method fetches all available data in our database
spotify_router.get('/search', (req, res) => {
    const { key } = req.query;
    console.log(spotifyApi.getAccessToken());

    // Search tracks whose name, album or artist contains 'Love'
    spotifyApi.searchTracks(key)
        .then(function(data) {
            console.log(`Search by "${key}"`, data.body);
            return res.json(data.body);
        }, function(err) {
            console.error(err);
        });
  });

module.exports = spotify_router;