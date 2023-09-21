const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String
}, {
    collection: 'users' // Koleksiyon adını burada belirtebilirsiniz
});

module.exports = mongoose.model('User', userSchema);
