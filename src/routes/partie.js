var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');

router.use('/', checkToken.checkToken, function (req, res, next) {
	next();
});

router.get('/', function (req, res, next) {
	res.render('partie', {
		user: req.user,
	});
});

router.post('/', function (req, res, next) {});
module.exports = router;
