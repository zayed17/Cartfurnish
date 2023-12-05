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
    offer: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    },
    images: {
        image1:{
          type:String,
          required:true
        },
        image2:{
          type:String,
          required:true
        },
        image3:{
          type:String,
          required:true
        },
        image4:{
          type:String,
          required:true
        }
      },
    is_blocked: {
        type: Boolean,
        default: false,
        required: true
    }
});

module.exports = mongoose.model("Product", productSchema);
