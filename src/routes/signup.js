let express = require('express');
let router = express.Router();
let validator = require('validator');
const Utilisateur = require('../models/utilisateurSchema');
const { check, validationResult, matchedData } = require('express-validator');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', (req, res) => {
	res.render('signup');
});

router.post('/', async (req, res, next) => {
	// Validation de l'existe d'un user avec le courriel entré
	Utilisateur.Model.findOne({ email: req.body.email }).exec((err, user) => {
		if (err) return res.json({ success: false, message: err });
		if (user) return res.json({ success: false, message: 'User with this email is already created' });
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
	const token = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET);
	res.json({ token: token });
});

module.exports = router;
