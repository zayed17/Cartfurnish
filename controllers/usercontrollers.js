const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require('ejs');
const Cart = require('../models/cartmodels');
const nodemailer = require('nodemailer');
const userOtpVerification = require('../models/userotpverification');
const Product = require('../models/productmodal')
const Address = require('../models/addressmodels')
const Category = require('../models/categorymodal')
const Order = require('../models/ordermodels')
const Coupon = require('../models/couponmodels')
const Banner = require('../models/bannermodels')
const Review = require('../models/reviewmodels')
const dotenv = require('dotenv')
const crypto = require("crypto")

const Razorpay = require('razorpay');

dotenv.config()

function generateUniqueId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uniqueId = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters.charAt(randomIndex);
    }
  
    return uniqueId;
  }

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


const loadhome = async (req, res) => {
    try {
        const user_id = req.session.user_id; 
        const cartData =  await Cart.findOne({user:user_id}).populate("product.productId")
        const userData = await User.findOne({_id:user_id})
        const banner = await Banner.find({})

        res.render('home',{user:userData,cart:cartData,banner});
    } catch (error) {
        console.log(error.message);
    }
}


const loadsignup = async (req, res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log(error.message);
    }
}

 

const insertuser = async (req, res) => {
    try {
        if (!req.body.name.trim() || !req.body.email.trim() || !req.body.mobile.trim() || !req.body.password.trim()) {
            return res.status(400).render('signup', { message: 'All fields are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email.trim())) {
            return res.status(400).render('signup', { message: 'Invalid email format.' });
        }

        if (req.body.password.trim().length < 8) {
            return res.status(400).render('signup', { message: 'Password must be at least 8 characters long.' });
        }

        const existingUser = await User.findOne({
            $or: [{ email: req.body.email.trim() }, { mobile: req.body.mobile.trim() }],
          });
      
          if (existingUser) {
            res.render('signup', { message: "User already exists" });
            return;
          }

          const existrefferal = await User.findOne({referral_code:req.body.referralCode})
          if(!existrefferal){
            return res.status(400).render('signup', { message: 'Refferal code is valid.' });
          }else{
            const data = {
                amount: 1000,
                date: new Date()
            };
            
            await User.findOneAndUpdate(
                { _id: existrefferal._id },
                {
                    $inc: { wallet: 1000 },
                    $push: { walletHistory: data }
                }
            );
          }
          const id = generateUniqueId(7);
          console.log(id,"id keto a");

        const spassword = await securePassword(req.body.password.trim());

        const { name, email, mobile } = req.body;
        const user = new User({
            name: name.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            password: spassword,
            referral_code: id
        });
        

        const userData = await user.save();
        await sendOtpVerificationEmail(userData, res);
        req.session.user_email = req.body.email
        console.log( req.session.user_email,"vvero");
      } catch (error) {
        console.error(error.message);
      }
    };


const loadVerificationPage = async(req,res)=>{
    try {
        const id = req.query.id;    
        res.render('otp',{id});
    } catch (error) {
        console.log(error.message);
    }
}

  


const sendOtpVerificationEmail = async ({ email, _id }, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: process.env.email_user, 
                pass: process.env.password_user
            }
        });

        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(otp);
        const hashedOtp = await bcrypt.hash(otp, 10);

        const mailOptions = {
            from: process.env.email_user,
            to: email,
            subject: "Verify Your Email",
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
                    <h2 style="color: #007BFF;">Welcome to Your App!</h2>
                    <p style="font-size: 16px;">Thank you for choosing our service. To complete your registration, please verify your email address.</p>
                    
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                        <p style="font-size: 18px; margin-bottom: 10px;">Verification Code:</p>
                        <h3 style="color: #007BFF; margin: 0; font-size: 24px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">${otp}</h3>
                        <p style="font-size: 14px; color: #666;">This code will expire soon, so please use it promptly.</p>
                    </div>
        
                    <p style="font-size: 14px; color: #666; margin-top: 20px;">Thank you for choosing our app!</p>
                </div>`
        };
        
        const userOtpVerificationRecord = await userOtpVerification.findOne({ userId: _id });

        if (userOtpVerificationRecord) {
            await userOtpVerification.updateOne({ userId: _id }, { otp: hashedOtp, createAt: Date.now() });
        } else {
            const newOtpVerification = new userOtpVerification({
                userId: _id,
                otp: hashedOtp,
                createAt: Date.now(),
            });

            await newOtpVerification.save();
        }



        await transporter.sendMail(mailOptions);
        res.redirect(`/verifyotp?id=${_id}`);
    } catch (error) {
        console.error('Error in sendOtpVerificationEmail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { otp, id: userId } = req.body;

        console.log(userId);

        const userOtpVerificationRecord = await userOtpVerification.findOne({ userId });

        console.log(userOtpVerificationRecord);

        if (!userOtpVerificationRecord) {
            return res.render('otp', { message: 'Otp expired' });
        }

        const { otp: hashedOtp } = userOtpVerificationRecord;

        console.log(otp);
        console.log(hashedOtp);

        const validOtp = await bcrypt.compare(otp, hashedOtp);

        console.log(validOtp, "is it valid");

        if (!validOtp) {
            return res.render('otp', { message: 'Invalid Otp. Please try again', id: userId });
        }

        await User.updateOne({ _id: userId }, { $set: { is_verified: true } });

        await userOtpVerification.deleteOne({ userId });

        req.session.user_id = userId;

        return res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
};

    
    

  


const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email });

        if (userData) {
            if (userData.is_verified === true) {
                if (userData.is_blocked==true) {
                    res.render('login', { message: "Your account is blocked by the admin." });
                } else {
                    const passwordMatch = await bcrypt.compare(password, userData.password);

                    if (passwordMatch) {
                        req.session.user_id = userData._id;
                        res.redirect('/');
                    } else {
                        res.render('login', { message: "Incorrect password" });
                    }
                }
            } else {
                sendOtpVerificationEmail(userData, res);
            }
        } else {
            res.render('login', { message: "Email is not registered. Please register first." });
        }
    } catch (error) {
        console.log(error.message);
    }
};


const loademailinput = async (req,res)=>{
    try {
        req.session.user_id = req.query.id;    
        res.render('loginwithotp');

    } catch (error) {
        console.log(error.message);
    }
}

const sentOtpbyMail = async(req,res)=>{
    try {
        // const userData = await User.findOne({email:req.body.email});
        const userData = await User.aggregate([
            { $match: { email: req.body.email } },
            { $unwind: "$walletHistory" },
            { $sort: { "walletHistory.date": -1 } },
            { $limit: 1 }
          ]); 
        if(!userData){
            res.render('loginwithotp',{message:'User not exist.'});
        }else{
            if(userData.is_verified==true){
                sendOtpVerificationEmail(userData,res);
            }else{
                res.render('loginwithotp',{message:'user not verifed. Verify now'});  
            }
        }
        
    } catch (error) {
        console.log(error.message);
    }
}


const loadlogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}


const loadshop = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const productsPerPage = 9; 
      const startIndex = (page - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const userData = await User.findOne({_id:req.session.user_id})

      const totalProducts = await Product.countDocuments({});
      const totalPages = Math.ceil(totalProducts / productsPerPage);
  
      const productData = await Product.find({is_blocked:false,isCategoryBlocked:false}).skip(startIndex).limit(productsPerPage).populate('categoryId')
      const category = await Category.find({})
      
      res.render('shop', { product: productData, currentPage: page, totalPages,user:userData , category });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  
const loadeachproduct = async(req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id})
        const id = req.query.id;
        console.log(id, id)
        const date = Date.now()
        const product = await Product.findOne({_id:id})
        const review = await Review.find({productId:id}).populate('userId')
        // const total = review.rating.reduce((acc,num)=>acc+num,0)
        // console.log(review[0],total);
      res.render("product",{product,user:userData,review,date})
    } catch (error) {
      console.log(error);
    }
  }

  const loadaccount = async(req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id})
        const  addresses = await Address.findOne({user:req.session.user_id})
        const orders = await Order.find({userId:req.session.user_id})
        const CouponData = await Coupon.find({})
       const user = req.session.user_id

        // console.log(addresses);
        // console.log(req.session.user_id);
        res.render('account',{userData,addresses,orders,CouponData,user})
    } catch (error) {
        console.log(error);
    }
  }

  const resendotp = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findOne({ _id: id });
        await sendOtpVerificationEmail({ email: userData.email, _id: userData._id }, res);
    } catch (error) {
        console.error('Error in resendotp:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const edituser = async (req, res) => {
    try {
            const userData = await User.findById(req.session.user_id)

       await User.findOneAndUpdate(
            { email: userData.email,  },
            {
                $set: {
                    name:req.body.editname,
                    mobile:req.body.editmobile,
                    email:req.body.editemail,
                },
            },
            { new: true }
        );
        res.redirect('/account')
    } catch (error) {
        console.log(error);
    }
}


const passwordchange = async(req,res)=>{
    try {
        const userData = await User.findById(req.session.user_id)

            if (req.body.currentpassword  || (req.body.newpassword && req.body.newpassword2)) {
                if (!req.body.newpassword || req.body.newpassword.trim() === "" || !req.body.newpassword2 || req.body.newpassword2.trim() === "") {
                    return res.render('account', { message: 'New passwords cannot be empty.'});
                }
            
                if (req.body.newpassword !== req.body.newpassword2) {
                    return res.render('account', { message: 'New passwords do not match.'});
                }
            
                if (req.body.newpassword.length < 8) {
                    return res.render('account', { message: 'New password must be at least 8 characters long.'});
                } else {
                    const matchPassword = await bcrypt.compare(req.body.currentpassword, userData.password);
            
                    if (matchPassword) {
                        sPassword = await securePassword(req.body.newpassword);
                    } else {
                        return res.render('account', { message: 'Current password is incorrect. Please try again.'});
                    }
                }
            } else {
                sPassword = userData.password;
                return res.render('account', { message: 'Please enter either a current password or new passwords.'});
            }
            await User.findOneAndUpdate(
                { email: userData.email,  },
                {
                    $set: {
                        password:sPassword
                    },
                },
                { new: true }
            );
            res.redirect('/account')

    } catch (error) {
        console.log(error);
    }
}



const invoice = async (req, res) => {
    try {
      const productId = req.query.productId;
      const orderId = req.query.orderId;
      console.log(productId,orderId)
      const orderData = await Order.findOne({_id:orderId}).populate('userId')
      const productsData = await Promise.all(
        orderData.products.map(async (product) => {
          const productDetails = await Product.findOne({ _id: product.productId });
          return {
            ...product.toObject(),
            productDetails,
          };
        })
      );       
      console.log(productsData,"details")
      const projectRoot = path.join(__dirname, '..');

      const invoiceTemplatePath = path.join(projectRoot, 'views', 'user', 'invoice.ejs');
      const htmlContent = await ejs.renderFile(invoiceTemplatePath, { productsData ,orderData});
  
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
  
      await page.setContent(htmlContent);
  
      // Generate PDF
      const pdfBuffer = await page.pdf();
  
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice.pdf`);
      res.send(pdfBuffer);
  
      await browser.close();
    } catch (error) {
      console.error('Error generating invoice:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
  });
  
  const walletReacharge = async (req, res) => {
    try {
      const id = generateUniqueId(7);
      const rechargeAmount = parseInt(req.body.rechargeAmount)
console.log(rechargeAmount,typeof(rechargeAmount),"herd");
      const options = {
        amount: rechargeAmount * 100,
        currency: "INR",
        receipt: "" + id,
      };
  
      console.log(options);
  
      const order = await new Promise((resolve, reject) => {
        instance.orders.create(options, function (err, order) {
          if (err) {
            reject(err);
          } else {
            resolve(order);
          }
        });
      });
  
      res.json({ success: true, order });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "An error occurred" });
    }
  };
  
  
  const verifypayment = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const paymentData = req.body;
        console.log(paymentData, "kitoot");
       console.log(typeof(paymentData.order.amount),paymentData.order.amount,"amount",parseInt(paymentData.rechargeAmount),typeof(parseInt(paymentData.rechargeAmount)));
        const totalAmount = parseInt(paymentData.rechargeAmount);
       console.log(totalAmount,typeof(totalAmount),"data type");
        const data = { amount: totalAmount, date: new Date() };

        console.log("first");
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
        hmac.update(paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id);
        const hmacValue = hmac.digest("hex");
        console.log("second");

        if (1==1) {
            console.log("third");

            const updateWallet = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $inc: { wallet: totalAmount }, 
                    $push: { walletHistory: data }, 
                },
                { new: true }
            );
       console.log(updateWallet,"wallet update")
            if (updateWallet) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Failed to update wallet.' });
            }
        } else {
            res.json({ success: false, message: 'Payment verification failed.' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};



module.exports = {
    loadhome,
    loadshop,
    loadlogin,
    loadsignup,
    insertuser,
    verifyOtp,
    loadVerificationPage,
    verifyLogin,
    sentOtpbyMail, 
    loademailinput,
    userLogout,
    loadeachproduct,
    loadaccount,
    resendotp,
    edituser,
    passwordchange,
    invoice,
    walletReacharge,
    verifypayment
}