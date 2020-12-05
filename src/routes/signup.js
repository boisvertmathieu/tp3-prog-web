const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Utilisateur = require('../models/utilisateurSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Called when accessing signup page
 */
router.get('/', (req, res) => {
	res.render('signup');
});

/**
 * Called when submitting a sign up request (submitting sign up form)
 */
router.post('/', async (req, res, next) => {
	//Validation
	check('email', 'Addresse email invalide').isEmail();
	check('password', 'Le mot de passe est invalide').isLength({ min: 4 }).equals(req.body.confPwd);
	check('username', "Nom d'utilisateur est invalide").isLength({ min: 4 });

	// Validation de l'existe d'un user avec le courriel entré
	Utilisateur.Model.findOne({ email: req.body.email }).exec((err, user) => {
		if (err) return res.json({ success: false, message: err });
		if (user) return res.sendStatus(403);
	});

	//Création du user
	let user = await new Utilisateur.Model({
		username: req.body.username,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 10),
		isAdmin: false,
	});
	await user.save();

	//If no errors, on créer un accessToken pour le user identifié.
	let accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' });

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
	res.cookie('token', accessToken, { httpOnly: true, expiresIn: '12h' });
	res.cookie('refresh-token', refreshToken, { httpOnly: true });
	res.redirect('home');
});

module.exports = router;
