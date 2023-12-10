const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const userOtpVerification = require('../models/userotpverification');
const Product = require('../models/productmodal')
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
        const userData = await User.findOne({_id:req.session.user_id})
        res.render('home',{user:userData});
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

const sendOtpVerificationEmail = async ({ email, _id }, res) => {
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
  
      await transporter.sendMail(mailOptions);
  
      res.redirect(`/verifyotp?id=${_id}`);
    } catch (error) {
      console.error(error);
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
            // req.session.user_id = userData._id;
            return res.redirect('/login')
        
  
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
  
      const productData = await Product.find({}).skip(startIndex).limit(productsPerPage);
  
      res.render('shop', { product: productData, currentPage: page, totalPages,user:userData });
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
        res.render('account',{userData})
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
}