let express = require('express');
let router = express.Router();
const mongoose = require('mongoose');
let Carte = require('../models/carteSchema');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
