let express = require('express');
let router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});

router.get('/', csrfProtection, (req, res) =>{
    res.render('home');
});



module.exports = router;
