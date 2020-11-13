let mongoose = require('mongoose');

let partie = mongoose.Schema({
    date_heure: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('partie', partie);
