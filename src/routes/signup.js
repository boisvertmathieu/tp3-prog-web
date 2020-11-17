let express = require('express');
let router = express.Router();
let validator = require('validator');
const Utilisateur = require('../models/utilisateurSchema');
const {check, validationResult, matchedData} = require('express-validator');
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const bcrypt = require('bcrypt')


/* GET home page. */
router.get('/', csrfProtection, (req, res) => {
    res.render('signup', {
        data: {},
        errors: {},
        //CSRF token generation
        csrfToken: req.csrfToken()
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

router.post('/', csrfProtection, [
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
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
        });
    }


    const data = matchedData(req);
    console.log('Sanitized: ', data);

    //TODO : Ajouter le user à la database
    let saltRounds = 10; //Number of hashing rounds done on string
    bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(data['password'], salt, (err, hash) => {
            if(err) {
                console.log(err);
                return handleError(err);
            } else {
                //Storing user and hashed password to db
                let user = new Utilisateur ({
                    username: data['username'],
                    email: data['email'],
                    password: hash,
                    isAdmin: false
                }); //Enlève l'attribut _v ajouté au model lors de l'insertion

                //Saving model instance, passing a callback
                user.save(function (err) {
                    if (err) {
                        console.log(err);
                        res.status(500);
                        res.render('signup', {
                            data: data,
                            errors: err,
                            csrfToken : req.csrfToken()
                        })
                    }
                })
            }
        });
    });

    req.flash('success', 'Thanks for the message! I\'ll be in touche :)');
    res.redirect('/home');


});

module.exports = router;
