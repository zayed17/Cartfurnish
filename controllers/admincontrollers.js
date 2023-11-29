const Admin = require('../models/adminmodel');
const User = require('../models/usermodel');
const bcrypt = require('bcrypt');


const loadadmin = async(req,res)=>{
    try {
        res.render('admin-login')
    } catch (error) {
        console.log(error);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const adminData = await User.findOne({email:email});

        if(adminData){
            const passwordMatch = await bcrypt.compare(password, adminData.password);
            if(passwordMatch){
                req.session.admin_id = adminData._id;
                res.redirect('/admin/dashboard')
            }else{
                res.render('admin-login',{message:"Email and password are incorrect"});
            }
        }else{
            res.render('admin-login',{message:"Email and password are incorrect"});
        }

    } catch (error) {
        console.log(error);
    }
}

const loaddashboard = async(req,res)=>{
    try {
        res.render('dashboard')
    } catch (error) {
        console.log(error);
    }
}

// const loaduser = async(req,res)=>{
//     try {
//         res.render('users')
//     } catch (error) {
//         console.log(error);
//     }
// }


const loaduser = async (req, res) => {
    try {

        const userData = await User.find();
        res.render('users', { users: userData });
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadadmin,
    verifyLogin,
    loaddashboard,
    loaduser
}