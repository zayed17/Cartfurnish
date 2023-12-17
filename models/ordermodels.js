const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    userId: {
        type:ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            productId: {
                type:ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
            price: {
                type: Number,
                required: true,
              },
              totalPrice: {
                type: Number,
                required: true,
              },
              status: {
                type: String,
              }
            }
    ],
});

module.exports = mongoose.model('Order', orderSchema);