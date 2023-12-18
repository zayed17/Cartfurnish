const express = require('express');
const userRoute = express();
const session = require('express-session');
const usercontrollers = require('../controllers/usercontrollers');
const config = require('../config/config');
const auth = require('../middleware/auth');
const cartcontrollers = require('../controllers/cartcontrollers')
const addresscontrollers = require('../controllers/addresscontrollers')
const ordercontrollers = require('../controllers/ordercontrollers')
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
userRoute.get('/verifyotp',auth.isLogin,usercontrollers.loadVerificationPage)
userRoute.post('/verifyotp',auth.isLogin,usercontrollers.verifyOtp)
userRoute.get('/login',auth.isLogout,usercontrollers.loadlogin);
userRoute.post('/login',auth.isLogout,usercontrollers.verifyLogin)
userRoute.get('/shop',usercontrollers.loadshop);
userRoute.get('/loginwithotp',auth.isLogin,usercontrollers.loademailinput)
userRoute.post('/loginwithotp',auth.isLogin,usercontrollers.sentOtpbyMail)
userRoute.post('/resendotp',auth.isLogin,usercontrollers.resendotp)
userRoute.get('/product',usercontrollers.loadeachproduct)
userRoute.get('/logout',auth.isLogin, usercontrollers.userLogout);
userRoute.get('/account',auth.isLogin,usercontrollers.loadaccount)
userRoute.get('/cart',cartcontrollers.loadcart)
userRoute.patch('/addtocart',cartcontrollers.addtocart)
userRoute.post('/updatecart',auth.isLogin,cartcontrollers.updatecart)
userRoute.get('/checkout',auth.isLogin,cartcontrollers.loadcheckoutpage)
userRoute.post('/removecartitem',auth.isLogin,cartcontrollers.removecartitem)
userRoute.post('/addaddress',auth.isLogin,addresscontrollers.addaddress)
userRoute.post('/placeorder',ordercontrollers.placeorder)
userRoute.get('/success',auth.isLogin,addresscontrollers.success)
userRoute.delete('/deleteaddress',usercontrollers.deleteaddress)
module.exports = userRoute;
