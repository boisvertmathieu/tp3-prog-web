let mongoose = require('mongoose');
let random = require('mongoose-simple-random');

const Schema = mongoose.Schema;
const CarteSchema = new Schema({
	cue: {
		type: String,
		required: true,
	},
	rep: {
		type: Number,
		required: true,
	},
	show: {
		type: String,
		required: true,
	},
});

CarteSchema.plugin(random);

let Carte = mongoose.model('Carte', CarteSchema);

module.exports.Schema = CarteSchema;
module.exports.Model = Carte;
