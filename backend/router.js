const express = require("express");
const router = express.Router();
const { getTypos, replaceTypo } = require("./controllers/typos.controller");

router.get("/typos", (req, res) => {
  return getTypos(req, res);
});
router.post("/replaceTypo", 
(req, res) => {
  return replaceTypo(req, res);
});
module.exports = router;
