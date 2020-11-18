let express = require('express');
let router = express.Router();
const Utilisateur = require('../models/utilisateurSchema');
const {check, validationResult, matchedData} = require('express-validator');
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* Page d'accueil de connexion */
router.get('/', (req, res) => {
    res.render('index');
});

/* Est appelé lorsque le fomulaire de connexion est envoyé */
router.post('/index', (req, res) => {

    // Validation des identifiants entrés

    Utilisateur.Model.findOne({email: req.body.email}).exec((err, user) => {
        if (err)
            return res.json({success: false, message: err})
        if (!user)
        return res.json({success: false, message: "Not user with this email is created"})
        if (!bcrypt.compareSync(req.body.password, user.password))
            return res.json({success: false, message: "Password is invalid"})

        const token = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET);
        res.json({token: token});
    });

});

module.exports = router;
