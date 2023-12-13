const Cart = require('../models/cartmodels');
const Product = require('../models/productmodal')
const mongoose = require('mongoose');
const { userLogout } = require('./usercontrollers');
const cartmodels = require('../models/cartmodels');



const loadcart = async(req,res)=>{
    try { 
      const user_id = req.session.user_id; 
      const cartData =  await Cart.findOne({user:user_id}).populate("product.productId")
      const subtotal = cartData.product.reduce((acc,val)=> acc+val.totalPrice,0)
      // console.log(cartData);
        res.render('cart',{cart:cartData,subtotal})
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




const updatecart = async (req, res) => {
    try {
    const product_id = req.body.productId
    const user_id = req.session.user_id
    const count = req.body.count
    const cartD = await Cart.findOne({ user: user_id })
    const product = cartD.product.filter((obj)=>obj.productId==product_id)
    const productData = await Product.findById(product_id)
    const cartData = await Cart.findOneAndUpdate({user:user_id,'product.productId':product_id},{$inc:{'product.$.quantity':count, 'product.$.totalPrice': count * cartD.product.find(p => p.productId.equals(product_id)).price,
}})
    res.json({ success: true });

    } catch (error) {
        console.log(error);
    }
    
};


const removecartitem = async (req, res) => {
    const productId = req.body.productId;
    const userId = req.session.user_id;

    try {
        await Cart.findOneAndUpdate(
            { user: userId }, // Change from userId to user
            {
                $pull: { product: { productId: productId } }, // Change from product to products
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


const loadcheckoutpage = async(req,res)=>{
    try {
        res.render('checkout')
    } catch (error) {
        console.log(error);
    }
}





  module.exports = {
    loadcart,
    addtocart,
    updatecart,
    loadcheckoutpage,
    removecartitem
  }