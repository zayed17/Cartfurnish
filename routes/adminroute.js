const express = require('express');
const adminRoute = express();
const session = require('express-session');
const config = require('../config/config');
const admincontrollers = require('../controllers/admincontrollers');
const productcontrollers = require('../controllers/productcontrollers');
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
adminRoute.get('/editproduct',auth.isLogin, productcontrollers.loadeditproduct);

adminRoute.get('/logout',admincontrollers.adminLogout)


module.exports = adminRoute;
