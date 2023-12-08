const express = require('express');
const userRoute = express();
const session = require('express-session');
const usercontrollers = require('../controllers/usercontrollers');
const config = require('../config/config');
const auth = require('../middleware/auth');


// Configure session middleware
userRoute.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));

// Parse JSON and URL-encoded data
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

// Set the view engine and views directory
userRoute.set('views', './views/user');

userRoute.get('/',usercontrollers.loadhome);
// userRoute.get('/home',auth.isLogin,usercontrollers.loadhome);
userRoute.get('/signup',auth.isLogout,usercontrollers.loadsignup)
userRoute.post('/signup',auth.isLogout,usercontrollers.insertuser);
userRoute.get('/verifyotp',usercontrollers.loadVerificationPage)
userRoute.post('/verifyotp',usercontrollers.verifyOtp)
userRoute.get('/login',auth.isLogout,usercontrollers.loadlogin);
userRoute.post('/login',auth.isLogout,usercontrollers.verifyLogin)
userRoute.get('/shop',usercontrollers.loadshop);
userRoute.get('/loginwithotp',usercontrollers.loademailinput)
userRoute.post('/loginwithotp',usercontrollers.sentOtpbyMail)
userRoute.get('/product',usercontrollers.loadeachproduct)
userRoute.get('/logout', usercontrollers.userLogout);

module.exports = userRoute;
