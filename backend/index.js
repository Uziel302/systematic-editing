const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const indexRouter = require("./router.js");
const MediaWikiStrategy = require("passport-mediawiki-oauth").OAuthStrategy;
const passport = require("passport");

passport.use(
  new MediaWikiStrategy(
    {
      consumerKey: process.env.consumerKey,
      consumerSecret: process.env.consumerSecret,
      callbackURL: "https://ctioc.org/api/auth/mediawiki/callback",
    },
    function (token, tokenSecret, profile, done) {
      profile.oauth = {
        consumer_key: process.env.consumerKey,
        consumer_secret: process.env.consumerSecret,
        token: token,
        token_secret: tokenSecret,
      };
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/api/auth/mediawiki",
  passport.authenticate("mediawiki", { scope: "session" })
);

app.get(
  "/api/auth/mediawiki/callback",
  passport.authenticate("mediawiki", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    //res.send('welcome! ' + JSON.stringify(req.user));
    res.redirect((process.env.front??'') + "success/" + req.user.displayName);
  }
);

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/api", indexRouter);

app.listen(4000, () => console.log("Server is running on port 4000"));
