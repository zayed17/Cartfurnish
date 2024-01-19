    const mongoose = require('mongoose');
    const ObjectId = mongoose.Schema.Types.ObjectId

    const productSchema = mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        categoryId: {
          type: ObjectId,
          ref: 'categories',
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
              required:false
            },
            image2:{
              type:String,
              required:false
            },
            image3:{
              type:String,
              required:false
            },
            image4:{
              type:String,
              required:false
            }
          },
          isCategoryBlocked: {
            type: Boolean,
            default: false
          },
        is_blocked: {
            type: Boolean,
            default: false,
            required: true
        }
    });

    module.exports = mongoose.model("Product", productSchema);
