const Address = require('../models/addressmodels');
const Cart = require('../models/cartmodels')
const Order = require('../models/ordermodels')
const Product = require('../models/productmodal')
const User = require('../models/usermodel')
const Razorpay = require('razorpay');
const crypto = require("crypto")

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});

//Place order
const placeorder = async (req, res) => {
  try {
    console.log(req.body);
    const userId = req.session.user_id;
    const addressIndex = !req.body.address ? 0 : req.body.address;
    const paymentMethod = req.body.payment;
    const status = paymentMethod == "COD" ? 'placed' : 'pending';
    console.log(paymentMethod, addressIndex, status, userId);

    if (!req.body.address) {
      const data = {
        fullName: req.body.fullName,
        country: req.body.country,
        housename: req.body.housename,
        state: req.body.state,
        city: req.body.city,
        pincode: req.body.pincode,
        phone: req.body.phone,
        email: req.body.email,
      };
      await Address.findOneAndUpdate(
        { user: userId },
        {
          $set: { user: userId },
          $push: { address: data },
        },
        { upsert: true, new: true }
      );
    }
    const addressData = await Address.findOne({ user: userId });
    const address = addressData.address[addressIndex];
    console.log(address);
    const cartData = await Cart.findOne({ user: userId });
    console.log(cartData);

    const totalAmount = cartData.product.reduce((acc, val) => acc + val.totalPrice, 0);
    console.log(totalAmount);
    const orderItems = cartData.product.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
      price: product.price,
      totalPrice: product.quantity * product.price,
      productstatus: "placed"
    }));

    const data = new Order({
      userId: userId,
      deliveryDetails: address,
      products: orderItems,
      purchaseDate: new Date(),
      totalAmount: totalAmount,
      status: status,
      paymentMethod: paymentMethod,
    });
    const orderData = await data.save();

    if (status == "placed") {
      for (const item of orderItems) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { quantity: -item.quantity } }
        );
      }
      await Cart.deleteOne({ user: userId });
      res.json({ placed: true });
    } else if (paymentMethod == "onlinePayment") {
      const options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: "" + orderData._id,
      };
      console.log(options);
      instance.orders.create(options, function (err, order) {
        res.json({ order });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//verify online payment
const verifypayment = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const paymentData = req.body
    console.log(paymentData, "kitoot");
    const cartData = await Cart.findOne({ user: userId });

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    hmac.update(paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id);
    const hmacValue = hmac.digest("hex");

    if (hmacValue == paymentData.razorpay_signature) {
      for (const productData of cartData.product) {
        const { productId, quantity } = productData;
        await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
      }
    }

    await Order.findByIdAndUpdate(
      { _id: paymentData.order.receipt },
      { $set: { status: "placed", paymentId: paymentData.payment.razorpay_payment_id } }
    );

    await Cart.deleteOne({ user: userId });
    res.json({ placed: true });
  } catch (error) {
    console.log(error.message);
  }
};

const loadorderdetail = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await Order.findOne({ _id: id }).populate('products.productId')
    
    res.render('orderdetails', { order: orderData })
  } catch (error) {
    console.log(error);
  }
}


//cancel product 
const cancelproduct = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.body.productId
    const orderData = await Order.findOneAndUpdate(
      { "products._id": productId },
      { $set: { "products.$.productstatus": 'cancel' } }
    );

    for (const orderProduct of orderData.products) {
      const product = orderProduct.productId;
      const count = orderProduct.quantity;

      await Product.updateOne({ _id: product }, { $inc: { quantity: count } });
    }

    if (orderData.paymentMethod != 'COD' && orderData.status != 'pending') {
      const data = {
        amount: orderData.totalAmount,
        date: new Date()
      }
      await User.findOneAndUpdate({ _id: userId }, { $inc: { wallet: orderData.totalAmount }, $push: { walletHistory: data } })
    }

    res.json({ cancel: true })
    console.log(productId, "product Id");
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  placeorder,
  verifypayment,
  loadorderdetail,
  cancelproduct
}