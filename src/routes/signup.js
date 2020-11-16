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
exports.verifyPasswordsMatch = (req, res, next) => {
    const confirmPassword = req.body.confPwd.trim();

    return check('password')
        .withMessage('Password is required and both of them must be identical')
        .equals(confirmPassword)
}
router.post('/', [
    check('username')
        .not().isEmpty()
        .withMessage('Username is required')
        .trim(),
    check('email', 'Email must be an email and is required')
        .not().isEmpty()
        .isEmail()
        .bail()
        .trim()
        .normalizeEmail(),
    check('password', 'Password is required and both of them must be identical')
        .not().isEmpty()
        .withMessage('Password is required and both of them must be identical')
        .custom((value, { req }) => {
            if (value !== req.body.confPwd) {
                throw new Error('Password is invalid. Both must match.');
            }
            return true;
        })
], (req, res, next) => {
    const errors = validationResult(req);

    // Validation de la présence d'erreurs lors de la validation du formulaire
    if (!errors.isEmpty()) {
        return res.render('signup', {
            data: req.body,
            errors: errors.mapped()
        });
    }

    const data = matchedData(req);
    console.log('Sanitized: ', data);

    req.flash('Success', 'Thanks for the message! I\'ll be in touche :)');
    res.redirect('/users');


});

module.exports = router;
