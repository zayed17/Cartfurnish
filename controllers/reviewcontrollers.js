const Review = require('../models/reviewmodels');

const addreview = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const productId = req.body.productId;
        const comment =req.body.reviewText;
        const rawStarRating = req.body.starRating
        const rating = parseInt(rawStarRating);
        const orderId = req.body.orderId;

        const review = new Review({
            productId,
            userId,
            rating,
            comment,
        }) 
        console.log(review)
        await review.save()

        res.redirect(`/orderdetails?id=${orderId}`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    addreview
}