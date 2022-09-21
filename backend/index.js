const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
const indexRouter = require('./router.js');
const MediaWikiStrategy = require('passport-mediawiki-oauth').OAuthStrategy;
const passport = require('passport');

passport.use(new MediaWikiStrategy({
    consumerKey: process.env.consumerKey,
    consumerSecret: process.env.consumerSecret,
    callbackURL: "localhost:3000"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate({ mediawikiGlobalId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/mediawiki',
  passport.authenticate('mediawiki', { scope: 'session' }));
 
app.get('/auth/mediawiki/callback', 
  passport.authenticate('mediawiki', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', indexRouter);

app.listen(3000,() => console.log('Server is running on port 3000'));
