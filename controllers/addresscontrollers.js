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



const success = async(req,res)=>{
    try {
        res.render('success')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    addaddress,
    success,
    addaddressprofile
}