const express = require('express');
const router = express.Router();
const { getTypos } = require('./controllers/typos.controller');

router.get('/wikitypos', (req, res) => { return getTypos(req, res); });
module.exports = router;
