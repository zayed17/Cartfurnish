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




const getUserStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user ? user.status : null;
  } catch (error) {
    console.error('Error fetching user status:', error);
    return null;
  }
};

const checkUserStatus = async (req, res, next) => {
  const userStatus = await getUserStatus(req.session.user_id);

  if (userStatus === 'blocked') {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/login');
    });
  } else {
    next();
  }
};


module.exports = {
    isLogin,
    isLogout,
    checkUserStatus
    
}