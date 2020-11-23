var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');
const Invitation = require('../models/invitationSchema');
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
router.get('/', function (req, res, next) {
	res.json(req.invitations);
});

/**
 * Permet de créer une invitation dont les données sont contenues en body de requête
 */
//TODO : Retourne une page d'erreur mais l'invitation est bel et bien enregistré dans la bd. À voir plus tard
router.post('/', function (req, res, next) {
	try {
		//Récupération des données de la partie dans le body de la requête
		let invitation = new Invitation.Model({
			id_user_to: req.body.id_user_to,
			id_partie: req.body.id_partie,
			status: req.body.status,
		});

		invitation.save();
	} catch (err) {
		console.log(err);
		res.json({ success: false, message: err });
	}
});

/**
 * Permet d'accepter une invitation à une partie identifiée
 */
router.put('/:id', function (req, res, next) {
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
			return res.json({
				success: true,
				message: 'Invitation accepté. Nombre de documents affectés: ' + affected.nModified,
			});
		}
	);
});

module.exports = router;
