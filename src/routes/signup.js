let express = require('express');
let router = express.Router();
let validator = require('validator');
const Utilisateur = require('../models/utilisateurSchema');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('signup', {
        data: {},
        errors: {}
    });
});

/* Handler POST */
/*
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

	res.render('signup', {getInfo: req.body});
});
 */

const {check, validationResult, matchedData} = require('express-validator');
router.post('/', [
    check('username')
        .not().isEmpty()
        .withMessage('Username is required')
        .trim(),
    check('email')
        .isEmail()
        .withMessage('Email must be an email and is required')
        .bail()
        .trim()
        .normalizeEmail()
], (req, res) => {
    const errors = validationResult(req);
    res.render('signup', {
        data: req.body,
        errors: errors.mapped()
    });

    const data = matchedData(req);
    console.log('Sanitized:', data);
});

module.exports = router;
