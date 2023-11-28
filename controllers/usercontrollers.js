const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const userOtpVerification = require('../models/userotpverification');
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
        res.render('home');
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

 




// const insertuser = async (req, res) => {
//     try {
//         // Validate request body before proceeding
//         if (!req.body.name || !req.body.email || !req.body.mobile || !req.body.password) {
//             return res.status(400).render('user/signup', { message: 'All fields are required.' });
//         }

//         // Additional validation logic for email and password
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(req.body.email)) {
//             return res.status(400).render('user/signup', { message: 'Invalid email format.' });
//         }

//         if (req.body.password.length < 8) {
//             return res.status(400).render('user/signup', { message: 'Password must be at least 8 characters long.' });
//         }

//         // Check if the email is already registered
//         const existingUser = await User.findOne({ email: req.body.email });
//         if (existingUser) {
//             return res.status(400).render('user/signup', { message: 'Email is already registered.' });
//         }

//         // Hash the password
//         const spassword = await securePassword(req.body.password);

//         // Create a new user instance without saving it to the database yet
//         const user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             mobile: req.body.mobile,
//             password: spassword
//         });

//         // Send OTP verification email and get the verification ID
//         const verificationId = await sendOtpVerificationEmail(user, res);
//         // Check if the OTP verification was successful
//         if (verificationId) {
//             // Update the user instance with the verification ID
//             user.verificationId = verificationId;

//             // Save the user to the database
//             const userData = await user.save();

//             // Check if the user was successfully saved
//             if (userData) {
//                 return res.render('user/signup', { message: 'Your registration has been successful' });
//             } else {
//                 return res.render('user/signup', { message: 'Your registration has failed' });
//             }
//         } else {
//             return res.render('user/signup', { message: 'OTP verification failed' });
//         }
//     } catch (error) {
//         console.error('Error during sign-up:', error);
//         return res.status(500).render('user/signup', { message: 'Internal server error during registration.' });
//     }
// };

// const insertuser = async (req, res) => {
//     try {
//         // Validate request body before proceeding
//         if (!req.body.name.trim() || !req.body.email.trim() || !req.body.mobile.trim() || !req.body.password.trim()) {
//             return res.status(400).render('user/signup', { message: 'All fields are required.' });
//         }

//         // Additional validation logic for email and password
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(req.body.email.trim())) {
//             return res.status(400).render('user/signup', { message: 'Invalid email format.' });
//         }

//         if (req.body.password.trim().length < 8) {
//             return res.status(400).render('user/signup', { message: 'Password must be at least 8 characters long.' });
//         }

//         // Check if the email is already registered
//         const existingUser = await User.findOne({ email: req.body.email.trim() });
//         if (existingUser) {
//             return res.status(400).render('user/signup', { message: 'Email is already registered.' });
//         }

//         // Hash the password
//         const spassword = await securePassword(req.body.password.trim());

//         // Create a new user instance without saving it to the database yet
//         const user = new User({
//             name: req.body.name.trim(),
//             email: req.body.email.trim(),
//             mobile: req.body.mobile.trim(),
//             password: spassword
//         });

//         // Send OTP verification email and get the verification ID
//         const verificationId = await sendOtpVerificationEmail(user, res);

//         // Check if the OTP verification was successful
//         if (verificationId) {
//             // Update the user instance with the verification ID
//             user.verificationId = verificationId;

//             // Save the user to the database
//             const userData = await user.save();

//             // Check if the user was successfully saved
//             if (userData) {
//                 return res.render('user/signup', { message: 'Your registration has been successful' });
//             } else {
//                 return res.render('user/signup', { message: 'Your registration has failed' });
//             }
//         } else {
//             return res.render('user/signup', { message: 'OTP verification failed' });
//         }
//     } catch (error) {
//         console.error('Error during sign-up:', error);

//         // Handle specific error types with more informative messages
//         if (error.name === 'ValidationError') {
//             return res.status(400).render('user/signup', { message: 'Validation error during registration.' });
//         }

//         return res.status(500).render('user/signup', { message: 'Internal server error during registration.' });
//     }
// };


const insertuser = async (req, res) => {
    try {
      const existingUser = await User.findOne({
        $or: [{ email: req.body.email }, { mobile: req.body.mobile }],
      });
  
      if (existingUser) {
        res.render('signup', { message: "User already exists" });
        return;
      }
  
      const hashedPassword = await securePassword(req.body.password);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: hashedPassword,
      });
  
      const userData = await user.save();
      await sendOtpVerificationEmail(userData, res);
    } catch (error) {
      console.error(error.message);
    }
  };
  

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
       
          if(!userOtpVerificationRecords.length){
            return res.render('otp',{ message:  `Otp expired <a href="/emailVerifyAfter" style="color:#dbcc8f;">verifyOtp</a> `  })
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

        const userData = await User.findOne({ email: email });

        if (userData) {
            if (userData.is_verified === true) {
                const passwordMatch = await bcrypt.compare(password, userData.password);

                if (passwordMatch) {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                } else {
                    res.render('login', { message: "Incorrect password" });
                }
            } else {
                res.render('login', { message: "User is not verified. Please verify your account." });
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
            res.render('loginwithotp',{message:'user doesnt exist.  Register</a>'});
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




const loadshop = async (req, res) => {
    try {
        res.render('shop');
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    securePassword,
    loadhome,
    loadshop,
    loadlogin,
    loadsignup,
    insertuser,
    verifyOtp,
    loadVerificationPage,
    verifyLogin,
    sentOtpbyMail,
    loademailinput
}