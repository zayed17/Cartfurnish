const express = require('express');
const adminRoute = express();
const session = require('express-session');
const config = require('../config/config');
const admincontrollers = require('../controllers/admincontrollers');
const productcontrollers = require('../controllers/productcontrollers');
const couponcontrollers = require('../controllers/couponcontrollers');
const ordercontrollers = require('../controllers/ordercontrollers')
const bannercontrollers = require('../controllers/bannercontrollers');
const multer = require('../middleware/multer');
const auth = require('../middleware/adminAuth')
// Configure session
adminRoute.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));

// Parse JSON and URL-encoded data
adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));

// Set the view engine and views directory
adminRoute.set('views', './views/admin');

// Admin Routes
adminRoute.get('/',auth.isLogout, admincontrollers.loadadmin);
adminRoute.post('/',admincontrollers.verifyLogin);
adminRoute.get('/dashboard',auth.isLogin, admincontrollers.loaddashboard);
adminRoute.get('/users',auth.isLogin, admincontrollers.loaduser);
adminRoute.patch('/blockusers/:id', admincontrollers.blockUser);
adminRoute.get('/report',auth.isLogin,admincontrollers.loadreport);
adminRoute.get('/report-download',admincontrollers.downloadReport)
adminRoute.get('/excelreport',admincontrollers.excelreport)

// Category Routes
adminRoute.get('/category',auth.isLogin, admincontrollers.loadcategory);
adminRoute.get('/editcategory',auth.isLogin, admincontrollers.loadeditCategory);
adminRoute.post('/editcategory',auth.isLogin, admincontrollers.editCategory);
adminRoute.patch('/blockcategory/:id',admincontrollers.blockCategory)
adminRoute.get('/addcategory',auth.isLogin, admincontrollers.loadaddcategory);
adminRoute.post('/addcategory',auth.isLogin, admincontrollers.addcategory);
// Product Routes
adminRoute.get("/product",auth.isLogin, productcontrollers.loadproduct);
adminRoute.patch('/blockproducts/:id',productcontrollers.blockProducts)
adminRoute.get('/addproduct',auth.isLogin, productcontrollers.loadaddproduct);
adminRoute.post('/addproduct',auth.isLogin, multer.uploadproduct, productcontrollers.addproduct);
adminRoute.get('/editproduct',auth.isLogin,productcontrollers.loadeditproduct)
adminRoute.post('/editproduct',auth.isLogin,multer.uploadproduct,productcontrollers.editproduct)
adminRoute.delete('/deleteImage',auth.isLogin,productcontrollers.deleteImage)

//coupon
adminRoute.get('/coupon',auth.isLogin,couponcontrollers.loadcoupon);
adminRoute.get('/addcoupon',auth.isLogin,couponcontrollers.loadaddcoupon);
adminRoute.post('/addcoupon',auth.isLogin,couponcontrollers.addcoupon);
adminRoute.get('/editcoupon',auth.isLogin,couponcontrollers.loadeditcoupon);
adminRoute.post('/editcoupon',auth.isLogin,couponcontrollers.editcoupon);

//Banner 
adminRoute.get('/banner',auth.isLogin,bannercontrollers.laodbanner)
adminRoute.get('/addbanner', auth.isLogin,bannercontrollers.loadaddbanner); 
adminRoute.post('/addbanner', auth.isLogin,multer.uploadBanner.single('image'),bannercontrollers.addbanner)
adminRoute.get('/editbanner', auth.isLogin,bannercontrollers.loadeditbanner)
adminRoute.post('/editbanner',auth.isLogin,multer.uploadBanner.single('image'),bannercontrollers.editbanner)
adminRoute.get('/logout',admincontrollers.adminLogout)

//order 
adminRoute.get('/order',auth.isLogin,ordercontrollers.loadordermanagement)
adminRoute.get('/showorder',auth.isLogin,ordercontrollers.loadshoworder)
adminRoute.post('/updateProductStatus',auth.isLogin,ordercontrollers.updatastatus)
adminRoute.get('/chart',auth.isLogin,admincontrollers.chartData)
adminRoute.get('/paymentChart',auth.isLogin,admincontrollers.paymentChartData)

module.exports = adminRoute;
