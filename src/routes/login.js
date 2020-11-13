let express = require('express');
let router = express.Router();
const mongoose = require('mongoose');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

module.exports = router;
