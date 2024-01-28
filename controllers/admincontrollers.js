const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const Category = require('../models/categorymodal')
const Product = require('../models/productmodal')
const Order = require('../models/ordermodels')
const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require('ejs');
const ExcelJS = require('exceljs');

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
const loaddashboard = async (req, res) => {
    try {
        const ordercount = await Order.countDocuments();
        const productcount = await Product.countDocuments();
        const categorycount = await Category.countDocuments();
        const order = await Order.find().populate('userId');

        const totalrevenue = await Order.aggregate([
            {
                $match: {
                    'products.productstatus': 'Delivered' 
                }
            },
            {
                $group: {
                    _id: null,
                    totalrevenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        const totalRevenueNumber = totalrevenue.map(result => result.totalrevenue)[0] || 0;

        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

        const monthlyrevenue = await Order.aggregate([
            {
                $match: {
                    'products.productstatus': 'Delivered', 
                    purchaseDate: {
                        $gte: startOfMonth,
                        $lt: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    monthlyrevenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        const monthlyRevenueNumber = monthlyrevenue.map(result => result.monthlyrevenue)[0] || 0;

        res.render('dashboard', { ordercount, productcount, categorycount, totalRevenueNumber, monthlyRevenueNumber, order });
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


// const listcategory = async (req, res) => {
//     try {
//       const category = req.params.id;
//       const userValue = await Category.findOne({ _id: category });
//       const categoryProduct = await Product.find({ categoryId: category });
//       console.log(product);
//       if (userValue.is_listed) {
//         await Category.updateOne({ _id: category }, { $set: { is_listed: false } });
//         await Product.updateMany({categoryId:categoryId},{$set:{isCategoryBlocked:true}})
//       } else {
//         await Category.updateOne({ _id: category }, { $set: { is_listed: true } });
//         await Product.updateMany({categoryId:categoryId},{$set:{isCategoryBlocked:false}})
//       }
//       res.json({ block: true });
//     } catch (error) {
//       console.log(error.message);
//     }
//   };


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




const editCategory = async (req, res) => {
    try {
        const categoryData = await Category.findById({_id: req.body.id  });
        const exist = await Category.findOne({ name: new RegExp(req.body.name, 'i') })
        if(exist){
            res.render('editcategory',{message:"Duplicate is not allowed!",categoryData})
        }
        await Category.findByIdAndUpdate(
            { _id: req.body.id },
            { $set: { name: req.body.name, description: req.body.description } }
        );
        res.redirect(`/admin/category?message=${'successfully added'}`);
    } catch (error) {
        console.log(error.message);
    }
};



const blockCategory=async (req, res) => {
    try {
      const categoryId = req.params.id; 
      console.log(categoryId);
      
      const categoryProduct = await Product.find({ categoryId: categoryId });
console.log(categoryProduct);

      const userValue = await Category.findOne({ _id: categoryId });
      if (userValue.is_list) {
        await Category.updateOne({ _id: categoryId }, { $set: { is_list: false } });
        await Product.updateMany({categoryId:categoryId},{$set:{isCategoryBlocked:true}})
      } else {
        await Category.updateOne({ _id: categoryId }, { $set: { is_list: true } });
        await Product.updateMany({categoryId:categoryId},{$set:{isCategoryBlocked:false}})

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


const loadreport = async(req,res)=>{
    try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    if (startDate && endDate) {
         filteredSales = await Order.find({purchaseDate: { $gte: startDate, $lte: endDate }, "products.productstatus":"Delivered"} ).populate('userId');
    }else{
        filteredSales = await Order.find({"products.productstatus":"Delivered"} ).populate('userId');

    }
    res.render('report', { order: filteredSales ,startDate,endDate});
    } catch (error) {
        console.log(error);
    }
}

const downloadReport = async(req,res)=>{
    try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate; 
    if (startDate && endDate) {
        filteredSales = await Order.find({purchaseDate: { $gte: startDate, $lte: endDate }, "products.productstatus":"Delivered"} ).populate('userId');
   }else{
       filteredSales = await Order.find({"products.productstatus":"Delivered"} ).populate('userId');
   }

   const projectRoot = path.join(__dirname, '..');

   const invoiceTemplatePath = path.join(projectRoot, 'views', 'admin', 'sale-report.ejs');
   const htmlContent = await ejs.renderFile(invoiceTemplatePath, { order:filteredSales});

   const browser = await puppeteer.launch();
   const page = await browser.newPage();

   await page.setContent(htmlContent);

   const pdfBuffer = await page.pdf();

   res.setHeader('Content-Type', 'application/pdf');
   res.setHeader('Content-Disposition', `attachment; filename=report-download.pdf`);
   res.send(pdfBuffer);

   await browser.close();

    } catch (error) {
        console.log(error);
    }
}

const excelreport = async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let filteredSales;

        if (startDate && endDate) {
            filteredSales = await Order.find({ purchaseDate: { $gte: startDate, $lte: endDate }, "products.productstatus": "Delivered" }).populate('userId');
        } else {
            filteredSales = await Order.find({ "products.productstatus": "Delivered" }).populate('userId');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.addRow(['Order ID', 'Billing Name', 'Date', 'Total', 'Payment Method']);

        filteredSales.forEach(order => {
            order.products.forEach(product => {
                worksheet.addRow([
                    order._id.toString().substring(6, 12).toUpperCase(),
                    order.userId.name,
                    new Date(order.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    product.price.toFixed(2),
                    order.paymentMethod
                ]);
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=report-download.xlsx');

        await workbook.xlsx.write(res);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const chartData = async (req, res) => {
    try {
        const salesData = await Order.aggregate([
            {
                $match: { "products.productstatus": "Delivered" }
            },
            {
                $group: {
                    _id: { $month: "$purchaseDate" },
                    totalAmount: { $sum: "$totalAmount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    totalAmount: 1,
                },
            },
            {
                $sort: { month: 1 },
            },
        ]);

        console.log(salesData);

        res.json(salesData);
    } catch (error) {
        console.error('Error fetching data from database:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const paymentChartData = async (req, res) => {
    try {
        const paymentData = await Order.aggregate([
            {
                $match: { "products.productstatus": "Delivered" }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    totalAmount: { $sum: "$totalAmount" },
                }
            },
        ]);

        console.log(paymentData);

        res.json(paymentData);
    } catch (error) {
        console.error('Error fetching payment data from the database:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    loadadmin,
    verifyLogin,
    loaddashboard,
    loaduser,
    loadaddcategory,
    addcategory,
    loadcategory,
    blockUser,
    // listcategory,
    loadeditCategory,
    editCategory,
    adminLogout,
    blockCategory,
    loadreport,
    downloadReport,
    excelreport,
    chartData,
    paymentChartData
}