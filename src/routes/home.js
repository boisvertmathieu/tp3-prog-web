let express = require('express');
let router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const checkToken = require('../middlewares/token');

router.get('/', checkToken.checkToken, (req, res) => {
	res.json({ success: true, message: 'Logged in', user: req.user });
});

module.exports = router;
