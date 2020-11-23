const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const checkToken = (req, res, next) => {
	const token = req.cookies.token;
	if (token == null || token === undefined) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

module.exports = {
	checkToken: checkToken,
};
