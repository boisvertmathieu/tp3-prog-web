const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Utilisateur = require('../models/utilisateurSchema');
const validationResult = require('express-validator');
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
	check('password', 'Le mot de passe est invalide').isLength({min: 4}).equals(red.body.confPwd);
	check('username', "Nom d'utilisateur est invalide").isLength({min: 4});

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

	//Création d'un token
	const token = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' });

	//Retour du token
	res.cookie('token', token, { httpOnly: true, expiresIn: '12h' });
	res.json({ token: token });
});

module.exports = router;
