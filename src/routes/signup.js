let express = require('express');
let router = express.Router();
let validator = require('validator');
const Utilisateur = require('../models/utilisateurSchema');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('signup');
});

/* Handler POST */
router.post('/', function (req, res, next) {
	let username = req.body.username.trim();
	let email = req.body.email.trim();
	let password = req.body.password.trim();
	let confPwd = req.body.confPwd.trim();
	let valid = true;
	let userExists = null;
	let errPwd, errUser, errEmail;
	let user = {
		'username': username,
		'email': email,
		'password': password,
		'confPwd' : confPwd
	};

	res.send(user);
});

module.exports = router;
