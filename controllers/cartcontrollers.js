const loadcart = async(req,res)=>{
    try {
        res.render('cart')
    } catch (error) {
        console.log(error);
    }
  }

  module.exports = {
    loadcart
  }