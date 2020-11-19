let express = require('express');
let router = express.Router();
const Utilisateur = require('../models/utilisateurSchema');
const RefreshToken = require('../models/refreshTokenSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

		let accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

		// Création d'un refresh token permettant à l'utilisateur de garder son accès à son token, malgré
		// son temps d'expiration cours. Le refresh token est supposé permette au user de se recréer un token
		// de façon sécuritaire
		let refreshToken = jwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET);
		let rt = new RefreshToken.Model({
			token: refreshToken,
		});
		rt.save();

		res.json({ accessToken: accessToken, refreshToken: refreshToken });
	});
});

router.post('/token', (req, res) => {
	//Validation de la présence du même refresh token dans dans le post dans la bd
	const refreshToken = req.body.token;

	RefreshToken.Model.findOne({ token: refreshToken }).exec((err, token) => {
		if (err) return res.json({ success: false, message: err });
		if (refreshToken == null) return res.sendStatus(401);
		if (token) return res.sendStatus(403); //Token déjà inclus dans la bd (pas accès)
	});

	// Vérification de l'intégrité du refresh token
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);

		// On créer un nouveau access token considérant que le refresh token est valide et
		// permet la création d'un nouveau token pour l'utilisateur
		const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '1h',
		});

		res.json({ accessToken: accessToken });
	});
});

module.exports = router;
