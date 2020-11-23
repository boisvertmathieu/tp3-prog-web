let mongoose = require('mongoose');

const username = 'dbAdmin';
const password = 'bPnHFnlLoOkZSCEN'; //TODO Ne pas laisser ceci en clair
const database = 'tp3';

class Database {
    constructor() {
        this._connect()
    }

    _connect() {
        mongoose.connect(`mongodb+srv://${username}:${password}@gagnonj-tp3-progwa.nvxnx.mongodb.net/${database}?retryWrites=true&w=majority`, {useFindAndModify: false})
            .then(() => {
                console.log('Database connection successful')
            })
            .catch(err => {
                console.error('Database connection error')
            })
    }
}

module.exports = new Database();
