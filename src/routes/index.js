let express = require('express');
let router = express.Router();
const mongoose = require('mongoose')
const UtilisateurSchema = require('../models/utilisateurSchema');
const {check, validationResult, matchedData} = require('express-validator');
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});

/* Page d'accueil de connexion */
router.get('/', csrfProtection, (req, res) => {
    res.render('index', {
        data: {},
        errors: {},
        csrfToken: req.csrfToken()
    });
});

/* Est appelé lorsque le fomulaire de connexion est envoyé */
router.post('/index',  csrfProtection, [
    check('email', 'Email must be an email and is required')
        .not().isEmpty()
        .isEmail()
        .bail()
        .trim()
        .normalizeEmail(),
    check('password', 'Password is required')
        .not().isEmpty()
        .custom((value, {req}) => {
            let user = mongoose.model('Utilisateur', UtilisateurSchema, 'utilisateurs');
            user.find({'email' : req.body.email.trim()}, 'email password', function (err, users) {
                if (err) {
                    console.log(err);
                    return;
                }
                /**
                 * users contient la liste des utilisateurs correspondant à l'email entré
                 * Le user.find retourne tous les utilisateurs ayant le même email, et leurs password
                 */
                console.log(user)
            })
        })
], (req, res) => {
    const errors = validationResult(req);

    // Validation de la présence d'erreurs lors de la validation du formulaire
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.render('index', {
            data: req.body,
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
        });
    }
    const data = matchedData(req);
    console.log('Sanitized: ', data);

    req.flash('success', 'Thanks for the message! I\'ll be in touch :)');
    res.redirect('/home');
});

module.exports = router;
