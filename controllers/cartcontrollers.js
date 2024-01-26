const Cart = require('../models/cartmodels');
const User = require('../models/usermodel')
const Product = require('../models/productmodal')
const mongoose = require('mongoose');
const { userLogout } = require('./usercontrollers');
const addressmodels = require('../models/addressmodels');


const loadcart = async(req,res)=>{
    try { 
      const user_id = req.session.user_id; 
      const cartData =  await Cart.findOne({user:user_id}).populate("product.productId")
      const subtotal = cartData?.product.reduce((acc,val)=> acc+val.totalPrice,0)
        res.render('cart',{cart:cartData,subtotal})
    } catch (error) {
        console.log(error);
    }
  }

  



const addtocart = async (req, res) => {
    try {
        const user_id = req.session.user_id; 
        if(!user_id){
            return res.json({session:false, error:"You want to Login"})
        } 
        console.log(req.session);
        const product_id = req.body.productId;



        const productData = await Product.findById(product_id);
        console.log(productData)
        if(productData.quantity==0){
            return res.json({ quantity: false, error: 'Product is out of stock' });
        }
        if (productData.quantity > 0) {
            const cartProduct = await Cart.findOne({ user: user_id, 'product.productId': product_id });
            
            if (cartProduct) {
                return res.status(200).json({ success: false, error: 'Product already in cart' });
            }

            const data = {
                productId: product_id,
                price: productData.price,
                totalPrice: productData.price,
            };

            console.log(productData.quantity);

            await Cart.findOneAndUpdate(
                { user: user_id },
                {
                    $set: { user: user_id, couponDiscount: 0 },
                    $push: { product: data },
                },
                { upsert: true, new: true }
            );

            return res.json({ success: true, stock: true });
        } 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};



const updatecart = async (req, res) => {
    try {
        
        const product_id = req.body.productId;
        const user_id = req.session.user_id;
        const count = req.body.count;

        console.log( product_id,"quantity");
        const product = await Product.findOne({_id:product_id})

        const cartD = await Cart.findOne({ user: user_id });
        if (count === -1) {
            const currentQuantity = cartD.product.find((p) => p.productId == product_id).quantity;
            if (currentQuantity <= 1) {
                return res.json({ success: false, message: 'Quantity cannot be decreased further.' });
            }
        }

        if (count === 1) {
            const currentQuantity = cartD.product.find((p) => p.productId == product_id).quantity;
            if (currentQuantity + count > product.quantity) {
                return res.json({ success: false, message: 'Cannot add more than the quantity' });
            }
        }

        const cartData = await Cart.findOneAndUpdate(
            { user: user_id, 'product.productId': product_id },
            {
                $inc: {
                    'product.$.quantity': count,
                    'product.$.totalPrice': count * cartD.product.find((p) => p.productId.equals(product_id)).price,
                },
            }
        );
        //CHECK $ 

        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



const removecartitem = async (req, res) => {
    const productId = req.body.productId;
    const userId = req.session.user_id;

    try {
        await Cart.findOneAndUpdate(
            { user: userId },
            {
                $pull: { product: { productId: productId } }, 
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
        const userId = req.session.user_id;
        const  addresses = await addressmodels.findOne({user:userId})
        const cartData = await Cart.findOne({user:userId}).populate('product.productId').populate('user')
        console.log(cartData);
        if(cartData){
            console.log(cartData.couponDiscount,"wh")
            cartData.couponDiscount!=0 ? await cartData.populate('couponDiscount') : 0
            const discountpercentage = cartData.couponDiscount !=0 ? cartData.couponDiscount.discountPercentage : 0;
            const maxDiscount = cartData.couponDiscount !=0 ? cartData.couponDiscount.maxDiscountAmount : 0;
            const subtotal = cartData.product.reduce((acc,val)=> acc+val.totalPrice,0);
            const percentageDiscount = subtotal - (discountpercentage/100) *subtotal;
            const discountAmount =subtotal - percentageDiscount;
            const discount = subtotal - maxDiscount
            console.log(discount,subtotal,"discount","subtotal")
            if(discountAmount<=maxDiscount){
                res.render('checkout',{addresses,discount:percentageDiscount,cartData,subtotal,disamo:discountAmount})
            }else{
                res.render('checkout',{addresses,discount,cartData,subtotal,disamo:maxDiscount})
            }
            console.log(discountpercentage,percentageDiscount,"percentage");
        }
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