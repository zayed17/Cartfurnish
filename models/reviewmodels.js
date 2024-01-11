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
        ref: "users",
        required: true
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String
    },
    votes: [{
        userId: {
            type: ObjectId,
            ref: 'users',
            required: true
        },
        type: {
            type: String,
            enum: ['like', 'dislike'],
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// reviewSchema.index({ 'votes.userId': 1, productId: 1 }, { unique: true });


module.exports = mongoose.model('Review', reviewSchema);
