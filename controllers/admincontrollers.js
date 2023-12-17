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


const listcategory = async (req, res) => {
    try {
      const category = req.params.id;
      const userValue = await Category.findOne({ _id: category });
      if (userValue.is_listed) {
        await Category.updateOne({ _id: category }, { $set: { is_listed: false } });
        req.session.user_id = null;
      } else {
        await Category.updateOne({ _id: category }, { $set: { is_listed: true } });
      }
      res.json({ block: true });
    } catch (error) {
      console.log(error.message);
    }
  };


  
const blockUser = async (req, res) => {
    try {
      const user = req.params.id;
      const userValue = await User.findOne({ _id: user });
      if (userValue.is_blocked) {
        await User.updateOne({ _id: user }, { $set: { is_blocked: false } });
      } else {
        await User.updateOne({ _id: user }, { $set: { is_blocked: true } });
        req.session.user_id = null;
      }
      res.json({ block: true });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
//   const loadeditCategory = async (req, res) => {
//     try {
//         const categoryData = await Category.findById(req.query.id);

//         // if (!categoryData) {
//         //     return res.render('editcategory', { error: 'Category not found' });
//         // }

//         res.render('editcategory', { categoryData });
//     } catch (error) {
//         console.error(error);
//         res.render('errorView', { error: 'Error loading category data' });
//     }
// };
const loadeditCategory=async(req,res)=>{
    try {
  
      const id = req.query.id;
      const categoryData = await Category.findById({ _id: id });
          if (categoryData) {
              res.render('editcategory', { categoryData: categoryData });
          }
    } catch (error) {
      console.log(error.message);
    }
  }



//   const editCategory = async (req, res) => {
//     try {
//         await Category.findByIdAndUpdate(
//             { _id: req.query.id },
//             { $set: { name: req.body.name, description: req.body.description } }
//         );
//         res.redirect(`/admin/category?message=${encodeURIComponent('Successfully updated')}`);
//     } catch (error) {
//         console.log(error.message);
//     }
// };

// const editCategory = async (req, res) => {
//     try {
//         const existingCategory = await Category.findOne({ name: req.body.name });

//         if (existingCategory && existingCategory._id.toString() !== req.query.id) {
//             return res.render('editcategory', { message: 'Category with the same name already exists' });
//         }

//         await Category.findByIdAndUpdate(
//             { _id: req.query.id },
//             { $set: { name: req.body.name, description: req.body.description } }
//         );

//         res.redirect(`/admin/category?message=${encodeURIComponent('Successfully updated')}`);
//     } catch (error) {
//         console.error(error.message);
//         res.render('editcategory', { message: 'Error updating category' });
//     }
// };



// const editCategory = async (req, res) => {
//     try {
//         const categoryName = req.body.name; // Corrected to match the form input name

//         const existingCategory = await Category.findOne({ name: categoryName });
//         if (existingCategory && existingCategory._id.toString() !== category_id) {
//             return res.render('editcategory', { message: "Already Exists" });
//         }

//         // Corrected the argument structure for findByIdAndUpdate
//         await Category.findByIdAndUpdate(        { _id: req.body.id },
            
//             { $set: { name: categoryName, description: req.body.description } });

//         res.redirect('/admin/category');

//     } catch (error) {
//         console.log(error.message);
//         res.render('500Error');
//     }
// };


const editCategory = async (req, res) => {
    try {
        await Category.findByIdAndUpdate(
            { _id: req.body.id },
            { $set: { name: req.body.name, description: req.body.description } }
        );
        res.redirect(`/admin/category?message=${'successfully added'}`);
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error (E11000)
            return res.render('editCategory', { message: 'Category name already exists' });
            // or you can redirect with a query parameter
            // return res.redirect(`/admin/category?error=${'Category name already exists'}`);
        }
        console.log(error.message);
        res.render('500Error');
    }
};



const blockCategory=async (req, res) => {
    try {
      const user = req.params.id; 
      const userValue = await Category.findOne({ _id: user });
      if (userValue.is_list) {
        await Category.updateOne({ _id: user }, { $set: { is_list: false } });
      } else {
        await Category.updateOne({ _id: user }, { $set: { is_list: true } });
      }
      res.json({ block: true });
    } catch (error) {
      console.log(error.message);
    }
}

const adminLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
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
    blockUser,
    listcategory,
    loadeditCategory,
    editCategory,
    adminLogout,
    blockCategory
}