const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    // offer: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Offer",
    //     required: false
    // },
    description: {
        type: String,
        required: true
    },
    images: [
        { type: String, required: true },
        { type: String, required: true },
        { type: String, required: true },
        { type: String, required: true }
    ],
    is_blocked: {
        type: Boolean,
        default: false,
        required: true
    }
});

module.exports = mongoose.model("Product", productSchema);
