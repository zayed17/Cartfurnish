// const mongoose = require('mongoose');

// const ObjectId = mongoose.Schema.Types.ObjectId

// const orderSchema = new mongoose.Schema({
//     userId: {
//         type:ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     products: [
//         {
//             productId: {
//                 type:ObjectId,
//                 ref: 'Product',
//                 required: true,
//             },
//             quantity: {
//                 type: Number,
//                 default: 1,
//             },
//             price: {
//                 type: Number,
//                 required: true,
//               },
//               totalPrice: {
//                 type: Number,
//                 required: true,
//               },
//               status: {
//                 type: String,
//               }
//             }
//     ],
// });

// module.exports = mongoose.model('Order', orderSchema);



const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    shipAddress: [
        {
            name: {
                type: String,
                required: true
            },
            companyName: String,
            country: {
                type: String,
                required: true
            },
            houseName: {
                type: String,
                required: true
            },
            appartmentNumber: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            zipcode: {
                type: String, // changed to string
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
        }
    ],
    orderedProducts: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: "Product" 
            },
            quantity: {
                type: Number,
                required: true
            },
            productDetails: {
                name: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                productImage: {
                    type: String,
                    required: true
                }
            }
        }
    ],
    orderNote: {
        type: String // corrected typo
    },
    purchaseDate: {
        type: Date,
        required: true
    },
    deliveredDate: {
        type: Date,
        default: null, // added default value
    },
    returnedDate: {
        type: Date,
        default: null, // added default value
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    usedCouponCode: String, // no required since it's optional
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'returned'], // added validation
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'paypal', 'cash'], // added validation
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'], // added validation
    },
});

module.exports = mongoose.model("Orders", ordersSchema);













const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  delivery_address:{
    type:Object,
    required:true
  },
  payment: {
    type: String,
    required: true,
    method: ['Cash on delivery', 'Razorpay']
  },
  products: [{
      productId: {
        type: mongoose.Types.ObjectId,
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
    }
  }],
  subtotal: {
    type: Number,
    required:true
  },
  status: {
    type: String,
    default: 'Attempted',
    status: ['Attempted', 'Success', 'Cancelled', 'Failed']
  },
  isOrder: {
    type: Boolean,
    default: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    required: true
  }
})

const Order = mongoose.model('Orders', orderSchema)
module.exports =Order