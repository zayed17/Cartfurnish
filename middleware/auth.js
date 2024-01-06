const User = require("../models/usermodel");

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      console.log(req.session.user_id);
      const userData = await User.findById(req.session.user_id);
      if (userData.is_blocked) {
        res.redirect('/signup');
      } else {
        next();
      }
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error in isLogin middleware:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const userData = await User.findById(req.session.user_id);
      if (userData.is_blocked) {
        next();
      } else {
        res.redirect('/');
      }
    } else {
      next();
    }
  } catch (error) {
    console.error('Error in isLogout middleware:', error.message);
    res.status(500).send('Internal Server Error');
  }
};


module.exports = {
  isLogin,
  isLogout,
  
};
