const placeorder = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const addressIndex = !req.body.address? 0:req.body.address


        if(!req.session.address){
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
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    placeorder
}