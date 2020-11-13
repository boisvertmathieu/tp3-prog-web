let mongoose = require('mongoose');

let utilisateur = mongoose.Schema({
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
        validate: (value) => {
            return validator.isEmail(value);
        }
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('utilisateur', utilisateur);
