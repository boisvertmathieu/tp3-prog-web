const jwt = require('jsonwebtoken');

const checkToken = (req, res, next) => {
	const authHeaders = req.headers['authorization'] || req.headers['x-access-token'];
	const token = authHeaders && authHeaders.split(' ')[1];
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

module.exports = {
	checkToken: checkToken,
};
