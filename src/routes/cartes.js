var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');
const Carte = require('../models/carteSchema');

router.use('/', checkToken.checkToken, function (req, res, next) {
	next();
});

/* GET users listing. */
router.get('/', function (req, res, next) {
	Carte.Model.find({})
		.sort({ cue: 'asc' })
		.exec(function (err, cards) {
			res.render('cartes', { user: req.user, cards: cards });
		});
});

router.post('/', async (req, res, next) => {
	res.setHeader('Content-Type', 'application/json');

	//TODO Validation des champs avant la modification
	//TODO check si l'utilisateur est admin
	if (req.user.isAdmin) {
		if(req.body.cue == null) return res.sendStatus(400);

		// Recherche sur cue car mongo veut parse en ObjectId tout ce qui est _id

		let carteAffecte = await Carte.Model.findOneAndUpdate(
			{ cue: req.body.cue },
			{
				$set: {
					cue: req.body.cue,
					rep: req.body.rep,
					show: req.body.displayName,
				},
			},
			{
				//Ajout de la carte si rien n'est trouvé
				upsert: true,
			}
		);

		if (carteAffecte == null)
		{
			return res.sendStatus(201);
		}
		else return res.sendStatus(200);
	} else {
		return res.sendStatus(403);
	}

});

router.delete('/', async (req, res, next) => {
	res.setHeader('Content-Type', 'application/json');

	if (req.user.isAdmin) {
		if(req.body.cue == null) return res.sendStatus(400);

		// Recherche sur cue car mongo veut parse en ObjectId tout ce qui est _id

		let carteAffecte = await Carte.Model.findOneAndDelete(
			{ cue: req.body.cue },
			function (err, card) {
				if (err){
					console.log("Error deleting : ", err)
					return res.sendStatus(400);
				}
				else {
					console.log("Deleted card : ", card)
				}
			}
		);

		if (carteAffecte == null)
		{
			return res.sendStatus(400);
		}
		else return res.sendStatus(200);
	} else {
		return res.sendStatus(403);
	}

});

module.exports = router;
