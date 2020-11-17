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
], async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);

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

    //TODO : Valider si un user avec ce email exite déjà avant l'ajout
    try {
        // Recherche de si un user existe déjà avec ce courriel
        let user = await Utilisateur.Model.findOne({email: req.body.email}).exec();
        if (!user) {
            // Aucun user avec ce email, création du user
            let hash = bcrypt.hashSync(req.body.password, 10);
            let user = new Utilisateur.Model ({
                username : req.body.username,
                email: req.body.email,
                password: hash,
                isAdmin: false
            });
            // Ajout du user
            user.save();
            req.flash('success', 'Thanks for the message! I\'ll be in touche :)');
            return res.redirect('/home');
        } else {
            res.render('signup', {
                data: req.body,
                // TODO : Les erreurs ne s'affichent pas
                errors: [
                    {
                        value: req.body.email,
                        msg: 'Email is already being user by another user',
                        param: 'email',
                        localtion: 'body',
                    }
                ],
                csrfToken: req.csrfToken()
            })
        }

    } catch (errors) {
        return res.status(500).send(errors);
    }

    /**
     * TODO : Ajouter une session. Dès que le user quitte la page home il n'est plus connecté parce que req.flash('success') n'existe plus
     */

});

module.exports = router;
