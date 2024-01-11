const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required : true
  },
  likes:{
    type:Number,
    default:0
  },
  imageUrl: {
    type: String,
    required : true
  },
  date:{
    type:Date,
    default:Date.now
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post ;