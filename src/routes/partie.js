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
	var uri = req.protocol + '://' + req.get('host') + req.originalUrl + '/jeu/' + room;
	res.redirect(uri);
});

router.get('/jeu/:id_partie',function (req, res, next) {
	//Validation que la partie existe
	console.log("Id Partie : ",req.params.id_partie);

	//Validation que l'id est de la bonne longeur (crash if exactly 24 chars)
	if (req.params.id_partie.length != 24)
		return res.json({ success: false, message: "L'id de la partie est invalide" })

	let partieId = mongoose.Types.ObjectId(req.params.id_partie);

	//TODO Ajouter validation que la partie n'est pas déjà passé

	Partie.Model.findById(partieId, function (errPartie, game) {
		if (errPartie) {
			console.log("Error : ", errPartie);
			return res.json({ success: false, message: errPartie });
		}
		else if (game == null){ //Partie n'existe pas dans la BD
			console.log("Partie is null");
			return res.json({ success: false, message: "La partie n'existe pas." })

		} else { //La partie a été trouvé
			console.log("Id utilisateur : ", req.user._id);
			//Vérification que l'utilisateur a accès à la partie
			Invitation.Model.findOne({id_partie: partieId, id_user_to: mongoose.Types.ObjectId(req.user._id)}, function (errInvitation, invite) {
				if (errInvitation) {
					console.log("Error : ", errInvitation);
					return res.json({ success: false, message: errInvitation });
				}
				else if (invite == null) {
					console.log(invite);
					console.log("Invitation is null");
					return res.json({ success: false, message: "Vous n'êtes pas invités à la partie haha" });
				}
				else { //Le joueur est invité
					console.log(invite);
					//TODO create unique socket for the game
					return res.render('jeu');
				}
			});
		}
	});

});

module.exports = router;
