const Cart = require('../models/cartmodels');
const Product = require('../models/productmodal')

const loadcart = async(req,res)=>{
    try {
        res.render('cart')
    } catch (error) {
        console.log(error);
    }
  }

  const addtocart = async(req, res) => {
    try {
        const user_id = req.session.user_id;
        const product_id = req.body.productId;
        const productData = await Product.findById(product_id);

        // Do something with productData and user_id

        // Send a response back to the client
        res.json({ stock: true }); // Adjust this based on your logic
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



  module.exports = {
    loadcart,
    addtocart
  }