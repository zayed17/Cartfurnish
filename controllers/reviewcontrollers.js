const { findOne } = require('../models/cartmodels');
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


    // const voting = async (req, res) => {
    //     try {
    //         console.log("is entering");
    //         console.log(req.session.user_id);  
    //         if (!req.session.user_id) {
    //             return res.json({ success: false, error: 'Unauthorized. User not logged in.' });
    //         }

    //         console.log('1')
    //         console.log(req.body)
    //         const { type, reviewId, productId } = req.body;

    //         const userVote = { userId: req.session.user_id, type };
    
    //         const updatedReview = await Review.findOneAndUpdate(
    //             { _id: reviewId  },
    //             { $push: { votes: userVote } },
    //             { new: true }
    //         );
    //         console.log(updatedReview);

    //         if (!updatedReview) {
    //             console.log("3")
    //             return res.status(404).json({ success: false, error: 'Review not found or user not authorized.' });
    //         }

    //         res.json({ success: true, updatedReview });
    //     } catch (error) {
    //         console.error('Error:', error);
    //         res.status(500).json({ success: false, error: 'Internal Server Error' });
    //     }
    // };



    const loadeditreview = async(req,res)=>{
        try {
            const { productid,orderid} = req.query;
            const userId = req.session.user_id;
            const review = await Review.findOne({productId:productid,userId})
            console.log(productid,review)
            res.json({review,orderid,productid});

        } catch (error) {
            console.log(error);
        }
    }

    const editReview = async(req,res)=>{
        try {
            const userId = req.session.user_id;
            const productId = req.body.productId;
            const comment =req.body.reviewText;
            const orderId = req.body.orderId;
            console.log(req.body)
                const updatedReview = await Review.findOneAndUpdate(
                    { productId: productId, userId },
                    { $set: { comment: comment } },
                  );
 
              
              res.redirect(`/orderdetails?id=${orderId}`);
        } catch (error) {
            console.log(error);
        }
    }

module.exports = {
    addreview,
    // voting
    loadeditreview,
    editReview
}