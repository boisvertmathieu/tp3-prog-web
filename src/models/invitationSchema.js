let mongoose = require('mongoose');
let Partie = require('./partieSchema');
let Utilisateur = require('./utilisateurSchema');

const Schema = mongoose.Schema;
const InvitationSchema = new Schema(
	{
		id_user_to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Utilisateur',
			required: true,
		},
		id_partie: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Partie',
			required: true,
		},
		status: {
			type: Number,
			default: 0,
			min: 0,
			max: 2,
		},
	},
	{ versionKey: false }
);

let Invitation = mongoose.model('Invitation', InvitationSchema);

module.exports.Schema = InvitationSchema;
module.exports.Model = Invitation;
