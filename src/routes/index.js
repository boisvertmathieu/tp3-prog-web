let express = require('express');
let router = express.Router();
const mongoose = require('mongoose')
const Utilisateur = require('../models/utilisateurSchema');
const {check, validationResult, matchedData} = require('express-validator');
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const bcrypt = require('bcrypt');

/* Page d'accueil de connexion */
router.get('/', csrfProtection, (req, res) => {
    res.render('index', {
        data: {},
        errors: {},
        csrfToken: req.csrfToken()
    });
});

/* Est appelé lorsque le fomulaire de connexion est envoyé */
router.post('/index', csrfProtection, [
    check('email', 'Email must be an email and is required')
        .not().isEmpty()
        .isEmail()
        .bail()
        .trim()
        .normalizeEmail(),
    check('password', 'Password is required')
        .not().isEmpty()
], async (req, res) => {
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

    // Validation des identifiants entrés
    try {
        let user = await Utilisateur.Model.findOne({email:req.body.email}).exec();
        // Aucune user correspondant aux identifiants trouvés
        if (!user) {
            return res.status(400).send({message: "Aucune utilisateur ne correspond au courriel entré"})
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(400).send({message: "Mauvais mot de passe"})
        }
    } catch (error) {
        res.status(500).send(error);
    }

    // TODO : Utiliser une session au lieu d'un req.flash. Dès que l'utilisateur quitte /home la variable success n'est plus reconnue
    req.flash('success', 'Thanks for the message! I\'ll be in touch :)');
    res.redirect('/home');
});

module.exports = router;
