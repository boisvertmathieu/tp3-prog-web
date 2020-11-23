let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let PartieSchema = new Schema({
    date_heure: {
        type: String,
        required: true
    }
}, {versionKey: false});

let Partie = mongoose.model('Partie', PartieSchema);

module.exports.Schema = PartieSchema;
module.exports.Model = Partie;
