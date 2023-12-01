const Admin = require('../models/adminmodel');
const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const Category = require('../models/category')

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

const blockUser = async (req, res) => {
    try {
      const userId = req.query.id
      // console.log(userId)
      const userData = await User.findOne({ _id: userId })
      const value = userData.is_blocked
      // console.log(value)
      if (value === true) {
        await User.findByIdAndUpdate({ _id: userId }, { $set: { is_blocked: false } })
        res.redirect('/admin/users')
      } else if (value === false) {
        await User.findByIdAndUpdate({ _id: userId }, { $set: { is_blocked: true } })
        if (req.session.user_id === userId) {
          req.session.user_id = ''
        }
        res.redirect('/admin    /users')
        // console.log(userData)
      }
    } catch (error) {
      console.log(error.message)
    }
  }
  

module.exports = {
    loadadmin,
    verifyLogin,
    loaddashboard,
    loaduser,
    loadaddcategory,
    addcategory,
    loadcategory,
    blockUser
}