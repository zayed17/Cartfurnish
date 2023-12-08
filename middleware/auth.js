const User = require("../models/usermodel");


const isLogin = async (req,res,next)=>{

    try {
        
        if(req.session.user_id){
            const userData = await User.findById(req.session.user_id)
            if(userData.is_blocked){
                res.redirect('/signup')
            }else{
                next();
            }   
        }else{
            res.redirect('/')
        }
        
    } catch (error) {
        
        console.log(error.message);

    }
}

const isLogout = async (req, res, next) => {
    try {
        
        if (req.session.user_id) {
            const userData = await User.findById(req.session.user_id)
            if(userData.is_blocked){
                next();
            }else{
                res.redirect('/')
            }
        } else {
            next();
        }
        
    } catch (error) {
        
        console.log(error.message);

    }
}




module.exports = {
    isLogin,
    isLogout,
    
}