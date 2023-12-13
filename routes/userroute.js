const express = require('express');
const userRoute = express();
const session = require('express-session');
const usercontrollers = require('../controllers/usercontrollers');
const config = require('../config/config');
const auth = require('../middleware/auth');
const cartcontrollers = require('../controllers/cartcontrollers')
const addresscontrollers = require('../controllers/addresscontrollers')
// Configure session middleware
userRoute.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    // cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } 
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
userRoute.get('/account',usercontrollers.loadaccount)
userRoute.get('/cart',cartcontrollers.loadcart)
userRoute.patch('/addtocart',cartcontrollers.addtocart)
userRoute.post('/updatecart',cartcontrollers.updatecart)
userRoute.get('/checkout',cartcontrollers.loadcheckoutpage)
userRoute.post('/removecartitem',cartcontrollers.removecartitem)
userRoute.post('/addaddress',addresscontrollers.addaddress)

module.exports = userRoute;
