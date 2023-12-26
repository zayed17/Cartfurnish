const Coupon = require('../models/couponmodels')


const loadcoupon = async(req,res)=>{
    try {
        const CouponData = await Coupon.find({})
        res.render('coupon',{coupon:CouponData})
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



const addcoupon = async (req, res) => {
    try {
        const couponData = await Coupon.findOne({ couponCode: req.body.couponCode });

        if (couponData) {
            return res.render("addCoupon", { error: 'Coupon code already exists' });
        }

        const data = new Coupon({
            name: req.body.name,
            couponCode: req.body.couponCode,
            discountAmount: req.body.discountAmount,
            activationDate: req.body.activationDate,
            expiryDate: req.body.expiryDate,
            criteriaAmount: req.body.criteriaAmount,
        });

        await data.save();
        res.redirect('/admin/coupon');
    } catch (error) {
        console.error(error.message);
    }
};

const loadeditcoupon = async(req,res)=>{
    try {
        const couponId = req.query.id;
        const coupon = await Coupon.findById(couponId)
        console.log(couponId);
        res.render('editcoupon',{coupon})
    } catch (error) {
        console.log(error);
    }
}
const editcoupon = async (req,res)=>{
    try {

        const couponId = req.body._id
    
        console.log(couponId);
        await Coupon.findOneAndUpdate({_id:couponId},
            {
            name: req.body.name,
            couponCode: req.body.couponCode,
            discountAmount: req.body.discountAmount,
            expiryDate: req.body.expiryDate,
            criteriaAmount: req.body.criteriaAmount,
            })
    
            res.redirect("/admin/coupon")

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadcoupon,
    loadaddcoupon,
    addcoupon,
    loadeditcoupon,
    editcoupon
}