var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');

router.get('/', checkToken.checkToken, function (req, res, next) {
	res.send('Partie lancé');
});
module.exports = router;
