const express = require("express");
const router = express.Router();
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
router.use(passport.initialize());
router.use(passport.session());

const { getTypos, replaceTypo } = require("./controllers/typos.controller");

router.get("/typos", (req, res) => {
  return getTypos(req, res);
});
router.post("/replaceTypo", 
(req, res) => {
  return replaceTypo(req, res);
});

router.get(
  "/auth/mediawiki",
  passport.authenticate("mediawiki", { scope: "session" })
);

router.get(
  "/auth/mediawiki/callback",
  passport.authenticate("mediawiki", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect((process.env.front??'') + "success/" + req.user.displayName);
  }
);
module.exports = router;
