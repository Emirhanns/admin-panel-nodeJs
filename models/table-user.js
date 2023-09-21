// models/table-user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
}, {
    collection: 'userlists' // Koleksiyon adını burada belirtin
});

module.exports = mongoose.model('TableUser', userSchema);
