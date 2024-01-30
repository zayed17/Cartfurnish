const Address = require('../models/addressmodels');
const User = require('../models/usermodel')

const addaddress = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const data = {
            fullName: req.body.fullName,
            country: req.body.country,
            housename: req.body.housename,
            state: req.body.state,
            city: req.body.city,
            pincode: req.body.pincode,
            phone: req.body.phone,
            email: req.body.email
        };

        // Update the address
        await Address.findOneAndUpdate(
            { user: userId },
            { $set: { user: userId }, $push: { address: data } },
            { upsert: true, new: true }
        );

        // Redirect to '/success'
        res.redirect('/success');

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const addaddressprofile = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const data = {
            fullName: req.body.fullName,
            country: req.body.country,
            housename: req.body.housename,
            state: req.body.state,
            city: req.body.city,
            pincode: req.body.pincode,
            phone: req.body.phone,
            email: req.body.email
        };

        // Update the address
        const updatedAddress = await Address.findOneAndUpdate(
            { user: userId },
            { $set: { user: userId }, $push: { address: data } },
            { upsert: true, new: true }
        );

        // Send a JSON response
        res.json({ add: true, address: updatedAddress });

    } catch (error) {
        console.error(error);
        res.status(500).json({ add: false, error: "Internal Server Error" });
    }
};

const deleteaddress = async (req,res)=>{
    try {
        const userId=req.session.user_id
        const addressId = req.body.id
   
        await Address.updateOne({user:userId},{$pull:{address:{_id:addressId}}})
   
       res.json({deleted:true})
    } catch (error) {
        
    }
  }

const success = async(req,res)=>{
    try {
        const id = req.query.id;
        res.render('success',{id})
    } catch (error) {
        console.log(error);
    }
}



const editaddress = async (req, res) => {
    try {
        console.log('hi')
        const userId = req.session.user_id;
        console.log(userId);
        console.log(req.body.addressId);
        console.log(req.body.phone)
  
        const updatedAddress = await Address.findOneAndUpdate(
            { user: userId, 'address._id': req.body.addressId },
            {
                $set: {
                    'address.$.fullName': req.body.fullName,
                    'address.$.country': req.body.country,
                    'address.$.housename': req.body.housename,  
                    'address.$.state': req.body.state,
                    'address.$.city': req.body.city,
                    'address.$.pincode': req.body.pincode,
                    'address.$.phone': req.body.phone,
                    'address.$.email': req.body.email,
                },
            },
            { new: true } 
        );
  
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };

module.exports = {
    addaddress,
    success,
    addaddressprofile,
    deleteaddress,
    // loadeditaddress,
    editaddress
}