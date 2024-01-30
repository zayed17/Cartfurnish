const express = require('express');
const session = require('express-session');
const usercontrollers = require('../controllers/usercontrollers');
const config = require('../config/config');
const auth = require('../middleware/auth');
const cartcontrollers = require('../controllers/cartcontrollers')
const addresscontrollers = require('../controllers/addresscontrollers')
const ordercontrollers = require('../controllers/ordercontrollers')
const couponcontrollers = require('../controllers/couponcontrollers')
const reviewcontrollers = require('../controllers/reviewcontrollers')
const flash = require('connect-flash');
const userRoute = express();

// Configure session middleware
userRoute.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    // cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } 
}));
userRoute.use(flash());

userRoute.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});
// Parse JSON and URL-encoded data
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

// Set the view engine and views directory
userRoute.set('views', './views/user');

userRoute.get('/',  usercontrollers.loadhome);
userRoute.get('/signup',auth.isLogout,usercontrollers.loadsignup)
userRoute.post('/signup',auth.isLogout,usercontrollers.insertuser);
userRoute.get('/verifyotp',auth.isLogout,usercontrollers.loadVerificationPage)
userRoute.post('/verifyotp',auth.isLogout,usercontrollers.verifyOtp)
userRoute.get('/login',auth.isLogout,usercontrollers.loadlogin);
userRoute.post('/login',auth.isLogout,usercontrollers.verifyLogin)
userRoute.get('/shop',usercontrollers.loadshop);
// userRoute.post('/shop',usercontrollers.loadshop);

userRoute.get('/loginwithotp',auth.isLogout,usercontrollers.loademailinput)
userRoute.post('/loginwithotp',auth.isLogout,usercontrollers.sentOtpbyMail)
userRoute.get('/resendotp',auth.isLogout,usercontrollers.resendotp)
userRoute.get('/product',usercontrollers.loadeachproduct)
userRoute.get('/logout',auth.isLogin, usercontrollers.userLogout);
userRoute.get('/account',auth.isLogin,usercontrollers.loadaccount)
userRoute.get('/cart',cartcontrollers.loadcart)
userRoute.patch('/addtocart',cartcontrollers.addtocart)
userRoute.post('/updatecart',cartcontrollers.updatecart)
userRoute.get('/checkout',auth.isLogin,cartcontrollers.loadcheckoutpage)
userRoute.post('/removecartitem',auth.isLogin,cartcontrollers.removecartitem)
userRoute.post('/addaddress',auth.isLogin,addresscontrollers.addaddress)
userRoute.post('/placeorder',auth.isLogin,ordercontrollers.placeorder)
userRoute.get('/success',auth.isLogin,addresscontrollers.success)
userRoute.delete('/deleteaddress',auth.isLogin,addresscontrollers.deleteaddress)
userRoute.post('/addaddresses',auth.isLogin,addresscontrollers.addaddressprofile)
userRoute.post('/editaddresses',auth.isLogin,addresscontrollers.editaddress)
userRoute.post('/edituser',auth.isLogin,usercontrollers.edituser)
userRoute.post('/passwordchange',auth.isLogin,usercontrollers.passwordchange)
userRoute.post('/verifypayment',auth.isLogin,ordercontrollers.verifypayment)
userRoute.get('/orderdetails',auth.isLogin,ordercontrollers.loadorderdetail)
userRoute.post('/cancelproduct',auth.isLogin,ordercontrollers.cancelproduct)
userRoute.post('/checkcoupon',auth.isLogin,couponcontrollers.checkcoupon)
userRoute.post('/removecoupon',auth.isLogin,couponcontrollers.removecoupon)
userRoute.get('/invoice',auth.isLogin,usercontrollers.invoice)
userRoute.post('/rechargeWallet',auth.isLogin,usercontrollers.walletReacharge)
userRoute.post('/returnproduct',auth.isLogin,ordercontrollers.returnproduct)
userRoute.post('/walletverify',auth.isLogin,usercontrollers.verifypayment)
userRoute.post('/submit-review',auth.isLogin,reviewcontrollers.addreview)
userRoute.get('/editReview',auth.isLogin,reviewcontrollers.loadeditreview)
userRoute.post('/submit-editreview',auth.isLogin,reviewcontrollers.editReview)

// userRoute.post('/vote',auth.isLogin,reviewcontrollers.voting)
userRoute.get('/search',usercontrollers.productSearch)
userRoute.get('/forgot',usercontrollers.loadforgot)
userRoute.post('/forgot',usercontrollers.forgot)
userRoute.get('/resetPassword:token',usercontrollers.loadresetpassword)
userRoute.post('/resetPassword',usercontrollers.resetPassword)

module.exports = userRoute;
