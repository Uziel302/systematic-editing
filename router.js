const express = require("express");

const router = express.Router();

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

module.exports = router;
