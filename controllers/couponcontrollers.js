const Coupon = require('../models/couponmodels')
const Cart = require('../models/cartmodels')

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

const checkcoupon = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const couponcode = req.body.coupon;
        const currentDate = new Date()
        const cartData = await Cart.findOne({user:userId})
        const cartTotal = cartData.product.reduce((acc,val)=>acc+val.totalPrice,0)
        const coupondata = await Coupon.findOne({couponCode:couponcode})
        console.log(coupondata);
        if(coupondata){
            if(currentDate >= coupondata.activationDate && currentDate <= coupondata.expiryDate){
                const exists = coupondata.usedUsers.includes(userId)
                if(!exists){
                    if(cartTotal>=coupondata.criteriaAmount){
                        await Coupon.findOneAndUpdate({couponCode:couponcode},{$push:{usedUsers:userId}})
                        await Cart.findOneAndUpdate({user:userId},{$set:{couponDiscount:coupondata._id}})
                        res.json({coupon:true})
                    }else{
                        res.json({coupon:'amountIssue'})
                    }
                }else{
                    res.json({coupon:'used'})
                }
            }else{
                res.json({coupon:'notAct'})
            }
        }else{
            res.json({coupon:false})
        }
        
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    loadcoupon,
    loadaddcoupon,
    addcoupon,
    loadeditcoupon,
    editcoupon,
    checkcoupon
}