var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');
const Carte = require('../models/carteSchema');

router.use('/', checkToken.checkToken, function (req, res, next) {
	next();
});

router.get('/', function (req, res, next) {
	res.render('partie', {
		user: req.user,
	});
});

router.post('/', function (req, res, next) {
	var room = req.body.id_partie;
	var uri = req.protocol + '://' + req.get('host') + req.originalUrl + '/jeu/' + room;
	res.redirect(uri);
});

router.get('/jeu/:id_partie', function (req, res, next) {
	Carte.Model.find({}, function (err, cartes) {
		if (err) return res.json({ success: false, message: err });
		// Selecting 10 cards at random
		cartes_jeu = [];
		for (var i = 0; i < 10; i++) {
			// Selection de 10 cartes au hasard dans le tableau de carte en paramètre
			// en générant un nombre aléatoire parmit le nombre d'item du tableau
			var index = Math.floor(Math.random() * cartes.length - 1);
			cartes_jeu.push(cartes[index].cue);
			// Suppression de l'item précédemment ajouté
			cartes.splice(index, 1);
		}
		return res.render('jeu', {
			cartes: cartes_jeu,
		});
	});
});

module.exports = router;
