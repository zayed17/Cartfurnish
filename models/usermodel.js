const mongoose = require('mongoose');

const userSchema  = mongoose.Schema({
 name:{
      type:String,
      required:true
  },
  email:{
      type:String,
      required:true
  },
  mobile:{
      type:String,
      required:true
  },
  password:{
      type:String,
      required:true
  },
  referral_code:{
    type:String,
    required:true,
    unique:true
  },
  is_verified:{
    type:Boolean,
    default:false,
    required:true
  },
    is_blocked: {
    type: Boolean,
    default: false
  },
    is_admin: {
    type: Boolean,
    default: false
  },
  wallet:{
    type:Number,
    default:0
},
walletHistory:[{
    date:{
        type:Date
    },
    amount:{
        type:Number,
    },
}]
}); 

module.exports = mongoose.model('users',userSchema); 