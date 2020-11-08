var mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: Number
}, {
        collection: 'logindetails'
    }
);

const register = mongoose.model('register', bookSchema);

module.exports = register;