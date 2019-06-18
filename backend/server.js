require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data');

const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;

const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

const spotify_router = require('./router/spotify')


// this is our MongoDB database
const dbRoute = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  /*
  User.findById(id, function(err, user) {
    done(err, user);
  });
  */
});


passport.use(
  new SpotifyStrategy(
    {
      clientID: "81142cfcbf1d46e0914d306bbe0c64d7",
      clientSecret: "2e5ebb14833949b6a88786acd6867237",
      callbackURL: 'http://localhost:3001/auth/spotify/callback'
    },
    function(access_token, refresh_token, expires_in, profile, done) {
      console.log(profile);
      return done(null, 
        { id: profile.id,
          access_token: access_token,
          refresh_token: refresh_token,
          expire: expires_in,
        });
    //  User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
    //    return done(err, user);
    //  });
    }
  )
);

app.get(
  '/auth/spotify', 
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private'],
    showDialog: true
  }), function(req, res) {
  // The request will be redirected to spotify for authentication, so this
  // function will not be called.
});

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: 'http://localhost:3000' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req);
    res.redirect('http://localhost:3000/mainpage' + 
      '/?access_token=' +
      req.user.access_token +
      '&refresh_token=' +
      req.user.refresh_token + 
      '&expire=' + 
      req.user.expires_in
    );
  }
);

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// this is our update method
// this method overwrites existing data in our database
router.post('/updateData', (req, res) => {
  const { id, update } = req.body;
  Data.findByIdAndUpdate(id, update, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete('/deleteData', (req, res) => {
  const { id } = req.body;
  Data.findByIdAndRemove(id, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// this is our create method
// this method adds new data in our database
router.post('/putData', (req, res) => {
  let data = new Data();

  const { id, message } = req.body;

  if ((!id && id !== 0) || !message) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  data.message = message;
  data.id = id;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

router.post('/putDataToken', (req, res) => {
  let data = new Data();

  const { user, message } = req.body;

  if ((!user && user !== 0) || !message) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  data.message = message;
  data.user = user;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// append /api for our http requests
app.use('/api', router);
app.use('/api/spotify', spotify_router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
