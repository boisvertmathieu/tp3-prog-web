var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');
const Invitation = require('../models/invitationSchema');
const Utilisateur = require('../models/utilisateurSchema');
const Partie = require('../models/partieSchema');

/**
 * Recherche de toutes les invitations du joueur dans chaque requêtes fait à /
 */
router.use('/', checkToken.checkToken, async function (req, res, next) {
	const invitations = await Invitation.Model.find({ id_user_to: req.user._id }).exec();
	req.invitations = invitations;
	next();
});

/**
 * Permet d'afficher toutes les invitations du joueurs
 */
router.get('/partie', function (req, res, next) {
	res.render('invitations', {
		user: req.user,
		data: req.invitations,
	});
});

/**
 * Permet de créer une invitation dont les données sont contenues en body de requête
 */
router.post('/partie', async function (req, res, next) {
	try {
		//Création d'un array avec l'id des joueurs concernés
		var usersIds = [req.user._id];

		//Vérification d'utilisateurs valides
		if (req.body.id_user_to1 != null) {
			let user = await Utilisateur.Model.findOne({ username: req.body.id_user_to1 });
			if (user) {
				usersIds.push(user.id);
			}
		}
		if (req.body.id_user_to2 != null) {
			let user = await Utilisateur.Model.findOne({ username: req.body.id_user_to2 });
			if (user) {
				usersIds.push(user.id);
			}
		}
		if (req.body.id_user_to3 != null) {
			let user = await Utilisateur.Model.findOne({ username: req.body.id_user_to3 });
			if (user) {
				usersIds.push(user.id);
			}
		}

		//Vérification qu'il y a au moins un joueur valide
		if (usersIds.length == 1)
			return res.json({ success: false, message: "Aucun des joueurs fournis n'est valide" });

		//Création d'une partie dans la BD
		let partie = new Partie.Model({
			date_heure: req.body.date_heure,
		});
		partie.save();

		//Envoi des invitations
		usersIds.forEach((idUser) => {
			let invitation = new Invitation.Model({
				id_user_to: idUser,
				id_partie: partie._id,
				status: 0,
			});

			invitation.save();
		});

		res.json({ success: true, message: 'Partie ajoutée avec succès' });
	} catch (err) {
		console.log(err);
		res.json({ success: false, message: err });
	}
});

/**
 * Permet d'accepter une invitation à une partie identifiée
 */
router.post('/partie/:id', function (req, res, next) {
	// Validation de si l'id de la partie correspont à une partie dont l'utilisateur
	// a bel et bein été invité
	let id_partie = req.params.id;
	let invitations = req.invitations;
	let is_included = false;
	invitations.forEach(function (invite) {
		if (invite.id_partie == id_partie) is_included = true;
	});

	if (!is_included) return res.json({ success: false, message: "Le joueur n'a pas été invité à cette partie" });

	//Changement du status de l'invitation pour l'accepter
	Invitation.Model.updateMany(
		{ id_user_to: req.user._id, id_partie: id_partie },
		{ status: 1 },
		function (err, affected) {
			if (err) return res.json({ success: false, message: err });

			//Redirection vers la partie
			var uri = req.protocol + '://' + req.get('host') + '/partie' + '/jeu?id=' + id_partie;
			res.redirect(uri);
		}
	);
});

router.post('/no-partie/:id', function (req, res, next) {
	// Validation de si l'id de la partie correspont à une partie dont l'utilisateur
	// a bel et bein été invité
	let id_partie = req.params.id;
	let invitations = req.invitations;
	let is_included = false;
	invitations.forEach(function (invite) {
		if (invite.id_partie == id_partie) is_included = true;
	});

	if (!is_included) return res.json({ success: false, message: "Le joueur n'a pas été invité à cette partie" });

	//Changement du status de l'invitation pour la refuser
	Invitation.Model.updateMany(
		{ id_user_to: req.user._id, id_partie: id_partie },
		{ status: 2 },
		function (err, affected) {
			if (err) return res.json({ success: false, message: err });
			return res.json({
				success: true,
				message: 'Invitation refusé. Nombre de documents affectés: ' + affected.nModified,
			});
		}
	);
});

module.exports = router;
