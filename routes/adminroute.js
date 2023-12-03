const express = require('express');
const adminRoute = express();
const session = require('express-session');
const config = require('../config/config');
const admincontrollers = require('../controllers/admincontrollers');
const multer = require('../middleware/multer')

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



adminRoute.get('/',admincontrollers.loadadmin);
adminRoute.post('/',admincontrollers.verifyLogin);
adminRoute.get('/dashboard',admincontrollers.loaddashboard);
adminRoute.get('/users',admincontrollers.loaduser)
adminRoute.post('/blockUser',admincontrollers.blockUser)
adminRoute.get('/category',admincontrollers.loadcategory)
adminRoute.get('/addcategory',admincontrollers.loadaddcategory)
adminRoute.post('/addcategory',admincontrollers.addcategory)

adminRoute.get('/addproduct',admincontrollers.loadaddproduct)
// adminRoute.post('/addproduct',multer.uploadproduct,admincontrollers.addproduct)


module.exports = adminRoute;