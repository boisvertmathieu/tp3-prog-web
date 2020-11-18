const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const RefreshTokenSchema = new Schema(
	{
		token: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{ versionKey: false }
); //Enlève l'attribut _v ajouté au model lors de l'insertion

let RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports.Schema = RefreshTokenSchema;
module.exports.Model = RefreshToken;
