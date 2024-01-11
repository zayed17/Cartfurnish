const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = mongoose.Schema({
    productId: {
        type: ObjectId,
        ref: "Product",
        required: true
    },
    userId: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String
    },
    likes: [{
        type: ObjectId,
        ref: 'User'
    }],
    // replies: [{
    //     userId: {
    //         type: ObjectId,
    //         ref: 'User',
    //         required: true
    //     },
    //     reply: {
    //         type: String,
    //         required: true
    //     },
    //     createdAt: {
    //         type: Date,
    //         default: Date.now
    //     }
    // }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', reviewSchema);
