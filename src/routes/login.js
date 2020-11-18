let express = require('express');
let router = express.Router();
const Utilisateur = require('../models/utilisateurSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const token = require('../middlewares/token');

// Locally stored refresh token
let refreshTokens = [];

/* Page d'accueil de connexion */
router.get('/', (req, res) => {
	res.render('login');
});

/* Est appelé lorsque le fomulaire de connexion est envoyé */
router.post('/', (req, res) => {
	// Validation des identifiants entrés
	Utilisateur.Model.findOne({ email: req.body.email }).exec((err, user) => {
		if (err) return res.json({ success: false, message: err });
		if (!user) return res.json({ success: false, message: 'Not user with this email is created' });
		if (!bcrypt.compareSync(req.body.password, user.password))
			return res.json({ success: false, message: 'Password is invalid' });

		let accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
		let refreshToken = jwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET);

		refreshTokens.push(refreshToken);

		res.json({ accessToken: accessToken, refreshToken: refreshToken });
	});
});

router.post('/token', (req, res) => {
	const refreshToken = req.body.token;
	if (refreshToken == null) return res.sendStatus(401);
	//Check if current refreshToken is still 'good', or is still stored locally and is still valid
	if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);

		const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '15s',
		});

		res.json({ accessToken: accessToken });
	});
});

module.exports = router;
