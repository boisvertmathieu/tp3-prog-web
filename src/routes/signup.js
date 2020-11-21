const express = require('express');
const router = express.Router();
const Utilisateur = require('../models/utilisateurSchema');
const validationResult = require('express-validator')
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
	const token = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

	//Retour du token
	res.json({ token: token });
});

module.exports = router;
