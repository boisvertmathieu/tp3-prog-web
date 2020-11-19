const mongoose = require('mongoose');

const validateEmail = function(email) {
    let re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
}

const Schema = mongoose.Schema;
const UtilisateurSchema =  new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validateEmail, 'Email must be valid']
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {versionKey: false}); //Enlève l'attribut _v ajouté au model lors de l'insertion

let Utilisateur = mongoose.model('Utilisateur', UtilisateurSchema);

module.exports.Schema = UtilisateurSchema;
module.exports.Model = Utilisateur;
