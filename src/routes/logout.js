let express = require('express');
let router = express.Router();
const RefreshToken = require('../models/refreshTokenSchema');
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
	res.render('logout');
});

router.delete('/', (req, res) => {
	const refreshToken = req.body.token;
	//Suppression du refresh token dans la bd
	RefreshToken.Model.deleteOne({ token: refreshToken }).exec((err) => {
		if (err) return res.json({ success: false, message: err });
	});
});

module.exports = router;
