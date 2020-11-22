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
	// Validation des identifiants entrés : recherche d'un user existant avec ce email
	Utilisateur.Model.findOne({ email: req.body.email }).exec((err, user) => {
		if (err) return res.json({ success: false, message: err });
		if (!user) return res.json({ success: false, message: 'Not user with this email is created' });
		if (!bcrypt.compareSync(req.body.password, user.password))
			return res.json({ success: false, message: 'Password is invalid' });

		//If no errors, on créer un accessToken pour le user identifié.
		let accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

		//On créer aussi un refreshToken afin de lui permettre de regénérer un accessToken quand celui-ci
		//va être expiré
		//On enregistre le refreshToken dans la bd
		//TODO : Voir si il faut enregistrer un nouveau refreshToken à CHAQUE requête POST de login. Un user faisant plusieurs requête POST /login créer plusieurs refreshToken pour rien
		let refreshToken = jwt.sign(user.toJSON(), process.env.REFRESH_TOKEN_SECRET);
		let rt = new RefreshToken.Model({
			token: refreshToken,
		});
		rt.save();

		//On retourne le accessToken et son refreshToken
		res.json({ accessToken: accessToken, refreshToken: refreshToken });
	});
});

/**
 * Appeler quand le accessToken du user a expiré, et que celui-ci veut un nouveau accessToken
 * à partir de son refreshToken storé dans la bd
 */
router.post('/token', (req, res) => {
	//Validation de la présence du current refresh token dans la bd
	const refreshToken = req.body.token;
	RefreshToken.Model.findOne({ token: refreshToken }).exec((err, token) => {
		if (err) return res.json({ success: false, message: err });
		if (refreshToken == null) return res.sendStatus(401);
		if (!token) return res.sendStatus(403); //Token n'est pas présent dans la bd (donc le user a pas d'accès)
	});

	// Vérification de l'intégrité du refresh token
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);

		// On créer un nouveau access token considérant que le refresh token est valide et présent dans la bd
		// On retourne seulement une partie des information du user avec le token (seulement le username), considérant
		// que la varibale 'user' contient maintenant plus d'information de nécessaire
		const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '1h',
		});

		res.json({ accessToken: accessToken });
	});
});

module.exports = router;
