let express = require('express');
let router = express.Router();
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
    //.custom() --- Valider si le mot de passe entré correspond au email dans la bd
], (req, res) => {
    const errors = validationResult(req);

    // Validation de la présence d'erreurs lors de la validation du formulaire
    if (!errors.isEmpty()) {
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
