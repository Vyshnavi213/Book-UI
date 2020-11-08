var mongoose = require("mongoose");

const bookAddSchema = new mongoose.Schema({
    name: String,
    author: String,
    price: Number,
    publishedYear: Number,
    publisher: String
}, {
        collection: 'books'
    }
);

const adding = mongoose.model('adding', bookAddSchema);

module.exports = adding;