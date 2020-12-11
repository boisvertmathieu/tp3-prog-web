let express = require('express');
let router = express.Router();
const checkToken = require('../middlewares/token');
const RefreshToken = require('../models/refreshTokenSchema');

router.use('/', checkToken.checkToken, function (req, res, next) {
	// Suppression du refreshToken dans la database
	const refreshToken = req.body.token;
	RefreshToken.Model.deleteMany({ token: refreshToken }).exec((err) => {
		if (err) return res.json({ success: false, message: err });
	});

	// Suppression des cookies locals
	res.cookie('token', {expires : new Date(0)});
	res.cookie('refresh-token', {expires : new Date(0)});

	next();
});

/**
 * Called when accessing logout page
 */
router.get('/', (req, res) => {
	res.render('logout');
});

/**
 * Called when logging out the current user of its session.
 * La méthode vient supprimer son refreshToken de la database afin qu'il ne puisse plus
 * regénérer d'accessToken pour avoir accès au site.
 */
router.delete('/', (req, res) => {
	const refreshToken = req.body.token;
	//Suppression du refresh token dans la bd
	RefreshToken.Model.deleteMany({ token: refreshToken }).exec((err) => {
		if (err) return res.json({ success: false, message: err });
	});
	res.sendStatus(204);
});

module.exports = router;
