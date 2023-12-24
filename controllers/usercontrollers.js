const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const Cart = require('../models/cartmodels');
const nodemailer = require('nodemailer');
const userOtpVerification = require('../models/userotpverification');
const Product = require('../models/productmodal')
const Address = require('../models/addressmodels')
const Category = require('../models/categorymodal')
const dotenv = require('dotenv')
dotenv.config()


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
        res.render('home',{user:userData,cart:cartData});
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
        // Validate request body before proceeding
        if (!req.body.name.trim() || !req.body.email.trim() || !req.body.mobile.trim() || !req.body.password.trim()) {
            return res.status(400).render('signup', { message: 'All fields are required.' });
        }

        // Additional validation logic for email and password
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email.trim())) {
            return res.status(400).render('signup', { message: 'Invalid email format.' });
        }

        if (req.body.password.trim().length < 8) {
            return res.status(400).render('signup', { message: 'Password must be at least 8 characters long.' });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({
            $or: [{ email: req.body.email.trim() }, { mobile: req.body.mobile.trim() }],
          });
      
          if (existingUser) {
            res.render('signup', { message: "User already exists" });
            return;
          }

        // Hash the password
        const spassword = await securePassword(req.body.password.trim());

        // Create a new user instance without saving it to the database yet
        const user = new User({
            name: req.body.name.trim(),
            email: req.body.email.trim(),
            mobile: req.body.mobile.trim(),
            password: spassword
        });

        const userData = await user.save();
        await sendOtpVerificationEmail(userData, res);
        req.session.user_email = req.body.email
        console.log( req.session.user_email,"vvero");
      } catch (error) {
        console.error(error.message);
      }
    };


// const insertuser = async (req, res) => {
//     try {
//       const existingUser = await User.findOne({
//         $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
//       });
  
//       if (existingUser) {
//         res.render('signup', { message: "User already exists" });
//         return;
//       }
  
//       const hashedPassword = await securePassword(req.body.password);
//       const user = new User({
//         name: req.body.name,
//         email: req.body.email,
//         mobile: req.body.mobile,
//         password: hashedPassword,
//       });
  
//       const userData = await user.save();
//       await sendOtpVerificationEmail(userData, res);
//     } catch (error) {
//       console.error(error.message);
//     }
//   };
  

const loadVerificationPage = async(req,res)=>{
    try {
        req.session.userId = req.query.id;    
        res.render('otp');
    } catch (error) {
        console.log(error.message);
    }
}

// const sendOtpVerificationEmail = async ({ email, _id }, res) => {
//     try {
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: true,
//         auth: {
//           user: process.env.email_user, // Your Gmail email address
//           pass: process.env.password_user
//         }
//       });
  
//       const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  
//       const hashedOtp = await bcrypt.hash(otp, 10);
  
//       const mailOptions = {
//         from: process.env.email_user,
//         to: email,
//         subject: "Verify Your Email",
//         html: `
//           <p> Enter <b>${otp}</b> in the app to verify your email address and complete</p>
//           <p> This code will expire soon </p>`
//       };
  
//       // Hash the OTP before storing it in the database
//       const newOtpVerification = new userOtpVerification({
//         userId: _id,
//         otp: hashedOtp,
//         createAt: Date.now(),
//         // expiresAt: Date.now() + 60000
//       });
  
//       await newOtpVerification.save();
  
//       await transporter.sendMail(mailOptions);
  
//       res.redirect(`/verifyotp?id=${_id}`);
//     } catch (error) {
//       console.error(error);
//     }
//   };
  


const sendOtpVerificationEmail = async ({ email, _id }, res, isResend = false) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: process.env.email_user, // Your Gmail email address
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
                <p> Enter <b>${otp}</b> in the app to verify your email address and complete</p>
                <p> This code will expire soon </p>`
        };

        // Hash the OTP before storing it in the database
        const newOtpVerification = new userOtpVerification({
            userId: _id,
            otp: hashedOtp,
            createAt: Date.now(),
            // expiresAt: Date.now() + 60000
        });

        await newOtpVerification.save();

        // If it's a resend, send a different response
        if (isResend) {
            res.status(200).json({ message: 'OTP resent successfully' });
        } else {
            // If it's not a resend, redirect to the verification page
            await transporter.sendMail(mailOptions);
            res.redirect(`/verifyotp?id=${_id}`);
            
        }
    } catch (error) {
        console.error('Error in sendOtpVerificationEmail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

  const verifyOtp=async(req,res)=>{
    try {
      const Otp= req.body.otp
      const userId=req.session.userId
     
       
          console.log(userId);
          const userOtpVerificationRecords= await userOtpVerification.find({userId})
       console.log(userOtpVerificationRecords);
          if(!userOtpVerificationRecords.length){
            return res.render('otp',{ message:  `Otp expired`  })
          }
        
            //user otp record exists
           const {otp:hashedOtp}=userOtpVerificationRecords[0];

            const enteredOtp=Otp
            //compare the entered otp
            console.log(enteredOtp);
            console.log(hashedOtp);
             const validOtp = await bcrypt.compare(enteredOtp, hashedOtp);
  
             if(!validOtp){
              //case otp invalid
             return res.render('otp',{message:'Invalid Otp Please try again'})
             }

           //update user to mask is verified true
            await User.updateOne({_id:userId},{$set:{is_verified:true }})


            //delete the used otp of otp database 
            await userOtpVerification.deleteOne({userId})
            req.session.user_id = userId;

            // req.session.user_id = userData._id;
            return res.redirect('/')
        
  
    } catch (error) {
      console.log(error.message);
    }
  }
  
  

// const verifyOtp=async(req,res)=>{
//     try {
//       const Otp= req.body.Otp
//       const userId=req.session.userId
       
       
//           console.log(userId);
//           const userOtpVerificationRecords= await userOtpVerification.find({userId})
       
//           if(!userOtpVerificationRecords.length){
//             return res.render('user/otp',{ message:  `Otp expired <a href="/emailVerifyAfter" style="color:#dbcc8f;">verifyOtp</a> `  })
//           }
        
//             //user otp record exists
//            const {otp:hashedOtp}=userOtpVerificationRecords[0];
        
//             const enteredOtp=Otp
//             //compare the entered otp
//             console.log(enteredOtp);
//             console.log(hashedOtp);
//              const validOtp = await bcrypt.compare(enteredOtp, hashedOtp);
  
//              if(!validOtp){
//               //case otp invalid
//              return res.render('user/otp',{message:'Invalid Otp Please try again'})
//              }
//            //update user to mask is verified true
//             await User.updateOne({_id:userId},{$set:{is_Verified:true }})
//             //delete the used otp of otp database 
//             await userOtpVerification.deleteOne({userId})
//             return res.redirect('/home')
//     } catch (error) {
//       console.log(error.message);
//     }
//   }
  
  


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
        req.session.userId = req.query.id;    
        res.render('loginwithotp');

    } catch (error) {
        console.log(error.message);
    }
}

const sentOtpbyMail = async(req,res)=>{
    try {
        const userData = await User.findOne({email:req.body.email});

        if(!userData){
            res.render('loginwithotp',{message:'User not exist.'});
        }else{
            if(userData.is_verified==1){
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
      const productsPerPage = 9; // Number of products per page
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
        const product = await Product.findOne({_id:id})
      res.render("product",{product,user:userData})
    } catch (error) {
      console.log(error);
    }
  }

  const loadaccount = async(req,res)=>{
    try {
        const userData = await User.findOne({_id:req.session.user_id})
        const  addresses = await Address.findOne({user:req.session.user_id})

        // console.log(addresses);
        // console.log(req.session.user_id);
        res.render('account',{userData,addresses})
    } catch (error) {
        console.log(error);
    }
  }



const resendotp = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.session.userId });
        console.log(userData.email,"ethano nnull");
        
        // Modify the next line to pass the correct parameters
        await sendOtpVerificationEmail({ email: userData.email, _id: userData._id }, res, true);
        
        res.render("loginwithotp", { email: userData.email });
    } catch (error) {
        console.log(error.message);
        res.render('500Error');
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
                // Check if at least one of the new passwords is provided
                if (!req.body.newpassword || req.body.newpassword.trim() === "" || !req.body.newpassword2 || req.body.newpassword2.trim() === "") {
                    return res.render('account', { message: 'New passwords cannot be empty.'});
                }
            
                // Check if both new passwords are the same
                if (req.body.newpassword !== req.body.newpassword2) {
                    return res.render('account', { message: 'New passwords do not match.'});
                }
            
                // Check if new password is at least 8 characters long
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
    passwordchange
    
}