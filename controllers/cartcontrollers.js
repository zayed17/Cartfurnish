const Cart = require('../models/cartmodels');
const Product = require('../models/productmodal')
const mongoose = require('mongoose');
const { userLogout } = require('./usercontrollers');
const cartmodels = require('../models/cartmodels');



const loadcart = async(req,res)=>{
    try { 
      const user_id = req.session.user_id; 
      const cartData =  await Cart.findOne({user:user_id}).populate("product.productId")
      // console.log(cartData);
        res.render('cart',{cart:cartData})
    } catch (error) {
        console.log(error);
    }
  }

  const addtocart = async (req, res) => {
    try {
        const user_id = req.session.user_id; 
        console.log(req.session);
        const product_id = req.body.productId;

        // Validate product_id as a valid ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid(product_id);
        if (!isValidObjectId) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        const productData = await Product.findById(product_id);

        if (productData.quantity > 0) {
            const cartProduct = await Cart.findOne({ user: user_id, 'products.productId': product_id });

            if (cartProduct) {
                return res.status(200).json({ success: false, error: 'Product already in cart' });
            }

            const data = {
                productId: product_id,
                price: productData.price,
                totalPrice: productData.price,
            };

            await Cart.findOneAndUpdate(
                { user: user_id },
                {
                    $set: { user: user_id},
                    $push: { product: data },
                },
                { upsert: true, new: true }
            );

            return res.status(200).json({ success: true, stock: true });
        } else {
            return res.status(200).json({ success: true, stock: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


  module.exports = {
    loadcart,
    addtocart
  }