let express = require('express');
let router = express.Router();
const RefreshToken = require('../models/refreshTokenSchema');

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
	RefreshToken.Model.deleteOne({ token: refreshToken }).exec((err) => {
		if (err) return res.json({ success: false, message: err });
	});
	res.sendStatus(204);
});

module.exports = router;
