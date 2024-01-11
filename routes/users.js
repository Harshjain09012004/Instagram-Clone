const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/Instagram");


const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required : true,
    unique : true
  },
  name:{
    type:String,
    required:true
  },
  email: {
    type: String,
    required : true,
    unique : true
  },
  password: {
    type: String,
  },
  description:{
    type:String
  },
  postId: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }],
  dpImage:{
    type:String
  },
  likedPost:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }]
});

userSchema.plugin(plm);

const User = mongoose.model('User', userSchema);

module.exports = User;