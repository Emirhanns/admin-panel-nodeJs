const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: String,
    productDescription: String,
    productImage: String,
    productPrice: Number 
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
