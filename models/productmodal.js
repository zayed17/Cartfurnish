const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        ref: "Category",
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
        required: false
    },
    images: [
        { type: String, required: true },
        { type: String, required: true },
        { type: String, required: true },
        { type: String, required: true }
    ],
    description: {
        type: String,
        required: true
    },
    is_blocked: {
        type: Boolean,
        default: false,
        required: true
    }
});

module.exports = mongoose.model("Product", productSchema);
