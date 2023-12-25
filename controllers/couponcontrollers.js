const loadcoupon = async(req,res)=>{
    try {
        res.render('coupon')
    } catch (error) {
        console.log(error);
    }
}

const loadaddcoupon = async(req,res)=>{
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadcoupon,
    loadaddcoupon 
}