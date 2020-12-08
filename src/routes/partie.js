var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');
const Carte = require('../models/carteSchema');
const Invitation = require('../models/invitationSchema');
const mongoose = require('mongoose');
const Partie = require('../models/partieSchema');

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
	var uri = req.protocol + '://' + req.get('host') + req.originalUrl + '/jeu?id=' + room;
	res.redirect(uri);
});

router.get('/jeu', function (req, res, next) {
	//Validation que la partie existe
	//console.log('Id Partie : ', req.params.id_partie);
	//Validation que l'id est de la bonne longeur (crash if exactly 24 chars)
	if (req.query.id.length != 24) return res.json({ success: false, message: "L'id de la partie est invalide" });

	let partieId = mongoose.Types.ObjectId(req.query.id);
	//TODO Ajouter validation que la partie n'est pas déjà passé

	Partie.Model.findById(partieId, function (errPartie, game) {
		if (errPartie) {
			console.log('Error : ', errPartie);
			return res.json({ success: false, message: errPartie });
		} else if (game == null) {
			//Partie n'existe pas dans la BD
			console.log("La partie n'existe pas");
			return res.json({ success: false, message: "La partie n'existe pas." });
		} else {
			//La partie a été trouvé
			console.log('************ Partie trouvée **************');
			console.log('Id utilisateur : ', req.user._id);
			//Vérification que l'utilisateur a accès à la partie
			Invitation.Model.findOne(
				{ id_partie: partieId, id_user_to: req.user._id },
				function (errInvitation, invite) {
					if (errInvitation) {
						console.log('Error : ', errInvitation);
						return res.json({ success: false, message: errInvitation });
					} else if (invite == null) {
						console.log("L'invitation n'existe pas");
						return res.json({
							success: false,
							message: "Vous n'êtes pas invités à la partie lol mdr t nul",
						});
					} else {
						//Le joueur est invité et rejoint la partie.
						//Récupération de 9 cartes aléatoire (4 par joueurs et 1 cartes commençant le timeline)
						Carte.Model.find({}, function (err, cartes) {
							if (err) return res.json({ success: false, message: err });
							var cartes_joueur = [];
							for (var i = 0; i < 9; i++) {
								var random = Math.floor(Math.random() * cartes.length - 1);
								cartes_joueur.push(cartes[random]);
							}
							return res.render('jeu', {
								id_partie: partieId,
								cartes: cartes_joueur,
							});
						});
					}
				}
			);
		}
	});
});

module.exports = router;
