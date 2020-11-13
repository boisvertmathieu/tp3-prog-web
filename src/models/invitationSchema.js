let mongoose = require('mongoose');
let partie = require('./partieSchema');
let utilisateur = require('./utilisateurSchema');

let invitation = mongoose.Schema({
    id_user_to: {
        type: utilisateur.ObjectID,
        required: true
    },
    id_partie: {
        type: partie.ObjectId,
        required: true
    },
    status: {
        type: Number,
        default: 0,
        min: 0,
        max: 2
    }
})

module.exports = mongoose.model('invitation', invitation);
