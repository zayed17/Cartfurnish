const placeorder = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const addressIndex = !req.body.address? 0:req.body.address


        if(!req.body.address){
            const data = {
                fullName:req.body.fullName,
                country:req.body.country,
                housename:req.body.housename,
                state:req.body.state,
                city:req.body.city,
                pincode:req.body.pincode,
                phone:req.body.phone,
                email:req.body.email
            }
            await Address.findOneAndUpdate(
                {user:userId},
                {
                    $set:{user:userId},$push:{address:data}
                },
                {upsert:true,new:true}
                );
        }
        const addressData = await Address.findOne({user:user_id})
        const address = addressData.address[addressIndex]
        const cartData = await Cart.findOne({user:user_id})
        const productData = cartData.products
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    placeorder
}