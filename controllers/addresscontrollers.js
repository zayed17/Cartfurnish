const Address = require('../models/addressmodels');
const User = require('../models/usermodel')

const addaddress = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        // console.log(userId);
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
            res.redirect('/success')
    } catch (error) {
        console.log(error);
    }
}

const success = async(req,res)=>{
    try {
        res.render('success')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    addaddress,
    success
}