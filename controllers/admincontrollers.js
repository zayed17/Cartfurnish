const Admin = require('../models/adminmodel');
const adminRoute = require('../routes/adminroute');


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
        const adminData = await Admin.findOne({email:email});

        if(adminData){
            const passwordMatch = await bcrypt.compare(password, adminData.password);
            if(passwordMatch){
                req.session.admin_id = adminData._id;
                res.redirect('/dashboard')
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
        res.render('index')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadadmin,
    verifyLogin,
    loaddashboard
}