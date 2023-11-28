const mongoose = require('mongoose');

const userOtpVerificationSchema = mongoose.Schema({
    userId:String, 
    otp:String,
    createAt:{
        type:Date,
        default:Date.now()
    }
})

userOtpVerificationSchema.index({createAt: 1},{expireAfterSeconds:60})

module.exports = mongoose.model('userOtpVerification',userOtpVerificationSchema);
