const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId


const ordersSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref:"users",
        required: true
    },
    deliveryDetails: {
        type: Object,
        required: true,
      },
      products: [{
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        totalPrice: {
        type: Number,
        default: 0
      },
      productstatus:{
        type:String,
        required:true
      }
    }],
    cancelReason: {
        type: String
      },
      returnReason: {
        type: String
      },
    purchaseDate: {
        type: Date,
        required: true
    },
    deliveredDate: {
        type: Date,
        default: null, 
    },
    returnedDate: {
        type: Date,
        default: null, 
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    usedCouponCode: String,
    status: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },

});

module.exports = mongoose.model("Orders", ordersSchema);












