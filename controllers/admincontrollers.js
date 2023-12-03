const Admin = require('../models/adminmodel');
const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const Category = require('../models/categorymodal')
const Product = require('../models/productmodal')
const Sharp = require('sharp');


const loadadmin = async(req,res)=>{
    try {
        res.render('admin-login')
    } catch (error) {
        console.log(error);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const adminData = await User.findOne({email:email});

        if(adminData && adminData.is_admin){
            const passwordMatch = await bcrypt.compare(password, adminData.password);
            if(passwordMatch){
                req.session.admin_id = adminData._id;
                res.redirect('/admin/dashboard')
            }else{
                res.render('admin-login',{message:"Email and password are incorrect"});
            }
        }else{
            res.render('admin-login',{message:"You are not admin"});
        }

    } catch (error) {
        console.log(error);
    }
}

const loaddashboard = async(req,res)=>{
    try {
        res.render('dashboard')
    } catch (error) {
        console.log(error);
    }
}


const loaduser = async (req, res) => {
    try {
        const userData = await User.find();
        res.render('users', { users: userData });
    } catch (error) {
        console.log(error.message);
    }
}


const loadaddcategory = async (req,res)=>{
    try {
        res.render('addcategory')
    } catch (error) {
        console.log(error);
    }
}

const addcategory = async (req, res) => {
    try {
        const name = req.body.name.trim();
        const description = req.body.description.trim();
        const isExists = await Category.findOne({ name: { $regex: '.*' + name + '.*', $options: 'i' } })

        if (!isExists) {
            const category = new Category({
                name,
                description
            })
            await category.save();
            res.redirect('/admin/category')
        }
        else {
            res.render('addcategory', { message: 'Category Name already exists' })
        }
    } catch (error) {
        console.log(error.message)
        res.render('addcategory', { message: error })
    }
}

const loadcategory = async(req,res)=>{
    try {
        const category = await Category.find({})
        res.render('categories',{category})
    } catch (error) {
        console.log(error);
    }
}

const blockUser = async(req,res)=>{
    try {
  
      const user_id =  req.body.userId
      const userData = await User.findOne({_id:user_id})
  
      if(userData.is_blocked){
       await User.findByIdAndUpdate({_id:user_id},{$set:{is_blocked:false}}) 
      }else{  
        await User.findByIdAndUpdate({_id:user_id},{$set:{is_blocked:true}})
      }
  
      res.json({block:true}) 
  
    } catch (error) {
        console.log(error.message);
        // res.render('500Error')
    }
  }

const loadaddproduct = async(req,res)=>{
    try {
        res.render('addproduct')
    } catch (error) {
        console.log();
    }
}


// const addproduct = async (req, res) => {
//     try {
//       const { name, quantity, category, price, description } = req.body;
      
//       // Check if required fields are present
  
//       // Get file information
//       const files = req.files;
//       const imagePaths = [];
  
//       // Process and save each image using Sharp
//       for (const key in files) {
//         if (Object.prototype.hasOwnProperty.call(files, key)) {
//           const image = files[key][0];
//           const imagePath = `public/assets/images/products/original/${image.filename}`;
//           const sharpPath = `public/assets/images/products/sharpened/${image.filename}`;
  
//           await Sharp(image.path).resize(500, 500).toFile(sharpPath);
  
//           imagePaths.push({
//             fieldName: key,
//             originalPath: imagePath,
//             sharpPath: sharpPath,
//           });
//         }
//       }
  
//       // Create a product instance
//       const product = new Product({
//         name,
//         quantity,
//         category: category,
//         price,
//         offer: null,
//         description,
//         images: imagePaths,
//         is_blocked: false,
//       });
  
//       // Save the product to the database
//       await product.save();
  
//       res.redirect('/addproduct');
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send("Internal Server Error");
//     }
//   };
  
  
module.exports = {
    loadadmin,
    verifyLogin,
    loaddashboard,
    loaduser,
    loadaddcategory,
    addcategory,
    loadcategory,
    blockUser,
    loadaddproduct,
    
}