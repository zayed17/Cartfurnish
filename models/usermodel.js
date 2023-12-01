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
  }
}); 

module.exports = mongoose.model('users',userSchema); 