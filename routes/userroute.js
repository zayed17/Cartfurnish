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
userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/user');

userRoute.get('/',auth.isLogout,usercontrollers.loadhome);
userRoute.get('/home',auth.isLogin,usercontrollers.loadhome);
userRoute.get('/signup',usercontrollers.loadsignup)
userRoute.post('/signup', usercontrollers.insertuser);
userRoute.get('/verifyotp',usercontrollers.loadVerificationPage)
userRoute.post('/verifyotp',usercontrollers.verifyOtp)
userRoute.get('/login',usercontrollers.loadlogin);
userRoute.post('/login',usercontrollers.verifyLogin)
userRoute.get('/shop',usercontrollers.loadshop);
userRoute.get('/loginwithotp',usercontrollers.loademailinput)
userRoute.post('/loginwithotp',usercontrollers.sentOtpbyMail)


module.exports = userRoute;
