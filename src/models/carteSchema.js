let mongoose = require('mongoose');

let carte = mongoose.Schema({
    cue: {
        type: String,
        required: true
    },
    rep: {
        type: Number,
        required: true
    },
    show: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('carte', carte);
