const Address = require('../models/addressmodels');
const Cart = require('../models/cartmodels')
const Order = require('../models/ordermodels')
const Product = require('../models/productmodal')
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});


const placeorder = async(req,res)=>{
    try {
      console.log(req.body);
        const userId = req.session.user_id;
        const addressIndex = !req.body.address? 0:req.body.address
        const paymentMethod = req.body.payment;
        const status = paymentMethod=="COD"?"placed":'pending'
        console.log(paymentMethod,addressIndex,userId);

        if(!req.body.address){
            const data = {
              fullName: req.body.fullName,
              country: req.body.country,
              housename: req.body.housename,
              state: req.body.state,
              city: req.body.city,
              pincode: req.body.pincode,
              phone: req.body.phone,
              email: req.body.email
            }
            await Address.findOneAndUpdate(
                {user:userId},
                {
                    $set:{user:userId},$push:{address:data}
                },
                {upsert:true,new:true}
                );
        }
        const addressData = await Address.findOne({user:userId})
        const address = addressData.address[addressIndex]
        console.log(address);
        const cartData = await Cart.findOne({user:userId})
        console.log(cartData);

      const totalAmount = cartData.product.reduce((acc, val) => acc + val.totalPrice, 0);
     console.log(totalAmount);
      const orderItems = cartData.product.map(product => ({
        productId: product.productId,
        quantity: product.quantity,
        price: product.price,
        totalPrice: product.quantity * product.price,
      }));

        const data = new Order({
        userId:userId,
        deliveryDetails:address,
        products:orderItems,
        purchaseDate:new Date(),
        totalAmount:totalAmount,
        status:status,
        paymentMethod:paymentMethod 
       })

       for (const item of orderItems) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { quantity: -item.quantity } }
        );
      }
      await Cart.deleteOne({user:userId})
       await data.save()
       res.redirect('/success')

    } catch (error) {
        console.log(error);
    }
}

const placeOrder = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const address = req.body.address;
      const cartData = await Cart.findOne({ userId });
      const products = cartData.products;
      const total = parseInt(req.body.Total);
      const paymentMethod = req.body.payment;
      const userData = await User.findOne({ _id: userId });
      const { name, wallet: walletBalance } = userData;
      const uniNum = Math.floor(Math.random() * 900000) + 100000;
      const status = paymentMethod === "COD" ? "placed" : "pending";
      const statusLevel = status === "placed" ? 1 : 0;
      const code = req.body.code;
  
      // User limit decreasing
      await Coupon.updateOne({ couponCode: code }, { $inc: { usersLimit: -1 }, $push: { usedUsers: userId } });
  
      // Creating a new Order document
      const order = new Order({
        deliveryDetails: address,
        uniqueId: uniNum,
        userId,
        userName: name,
        paymentMethod,
        products,
        totalAmount: total,
        date: new Date(),
        status,
        statusLevel,
      });
  
      const orderData = await order.save();
      const orderId = orderData._id;
  
      // Handle Cash on Delivery
      if (order.status === "placed") {
        await handleCashOnDelivery(req, userId, products, orderId, code);
      } else {
        // Handle Online Payment and Wallet Payment
        await handleOnlinePayment(req, res, userId, products, orderId, total, paymentMethod, walletBalance, code);
      }
  
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Helper function to handle Cash on Delivery
  const handleCashOnDelivery = async (req, userId, products, orderId, code) => {
    await Cart.deleteOne({ userId });
    for (const { productId, count } of products) {
      await Product.findOneAndUpdate({ _id: productId }, { $inc: { quantity: -count } });
    }
  
    if (req.session.code) {
      const coupon = await Coupon.findOne({ couponCode: req.session.code });
      const disAmount = coupon.discountAmount;
      await Order.updateOne({ _id: orderId }, { $set: { discount: disAmount } });
    }
  
    res.json({ codsuccess: true, orderId });
  };
  
  // Helper function to handle Online Payment and Wallet Payment
  const handleOnlinePayment = async (req, res, userId, products, orderId, total, paymentMethod, walletBalance, code) => {
    const walletPayment = paymentMethod === 'wallet';
    const onlinePayment = paymentMethod === 'onlinePayment';
  
    if (walletPayment && walletBalance < total) {
      return res.json({ walletFailed: true });
    }
  
    if (walletPayment) {
      await handleWalletPayment(userId, total, orderId);
    } else if (onlinePayment) {
      await handleOnlinePaymentRazorpay(res, orderId, total);
    }
  };
  
  // Helper function to handle Wallet Payment
  const handleWalletPayment = async (userId, total, orderId) => {
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { wallet: -total },
        $push: {
          walletHistory: {
            date: new Date(),
            amount: total,
            reason: 'Purchased Amount Debited.',
          },
        },
      },
      { new: true }
    );
    await Order.findByIdAndUpdate(orderId, { status: 'placed', statusLevel: 1 }, { new: true });
  };
  
  // Helper function to handle Online Payment using Razorpay
  const handleOnlinePaymentRazorpay = async (res, orderId, total) => {
    const options = {
      amount: total * 100,
      currency: 'INR',
      receipt: '' + orderId,
    };
  
    instance.orders.create(options, (err, order) => {
      res.json({ order });
    });
  };
  

module.exports = {
    placeorder
}