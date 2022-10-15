const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const indexRouter = require("./router.js");
const port = parseInt(process.env.PORT ?? 3000, 10); 
const session = require("express-session");

const crendentials = require('./credential.json');
const passport = require("passport");
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
app.use( session( {
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30
  },
  secret: crendentials.consumer_secret
} ) );
app.use(passport.initialize());
app.use(passport.session());
const MediaWikiStrategy = require("passport-mediawiki-oauth").OAuthStrategy;
passport.use(
  new MediaWikiStrategy(
    {
      consumerKey: crendentials.consumer_key,
      consumerSecret: crendentials.consumer_secret,
      callbackURL: "https://typos.toolforge.org/auth/mediawiki/callback",
    },
    function (token, tokenSecret, profile, done) {
      profile.oauth = {
        consumer_key: crendentials.consumer_key,
        consumer_secret: crendentials.consumer_secret,
        token: token,
        token_secret: tokenSecret,
      };
      return done(null, profile);
    }
  )
);

app.get(
  "/auth/mediawiki",
  passport.authenticate("mediawiki", { scope: "session" })
);

app.get(
  "/auth/mediawiki/callback",
  passport.authenticate("mediawiki", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect((crendentials.front ?? ""));
  }
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/api", indexRouter);

app.use(express.static('angular'));

app.listen(port, () => console.log("Server is running on port "+port));
