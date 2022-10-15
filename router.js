const express = require("express");
const crendentials = require('./credential.json');

const router = express.Router();
const MediaWikiStrategy = require("passport-mediawiki-oauth").OAuthStrategy;
const passport = require("passport");
passport.use(
  new MediaWikiStrategy(
    {
      consumerKey: crendentials.consumer_key,
      consumerSecret: crendentials.consumer_secret,
      callbackURL: "https://typos.toolforge.org/api/auth/mediawiki/callback",
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

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
router.use(passport.initialize());
router.use(passport.session());

const { getTypos, replaceTypo, dismissTypo, checkSession, clearSession } = require("./controllers/typos.controller");

router.get("/typos", (req, res) => {
  return getTypos(req, res);
});

router.get("/checkSession", (req, res) => {
  return checkSession(req, res);
});

router.get("/clearSession", (req, res) => {
  return clearSession(req, res);
});

router.post("/replaceTypo", (req, res) => {
  return replaceTypo(req, res);
});
router.post("/dismissTypo", (req, res) => {
  return dismissTypo(req, res);
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
    res.redirect((crendentials.front ?? "") + "success/" + req.user.displayName);
  }
);
module.exports = router;
