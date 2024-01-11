var express = require('express');
var router = express.Router();
var postModel = require('./posts');
var userModel = require('./users');
var passport = require('passport');

const upload = require('./multer');

var localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()))

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if(err){return next(err)}
    res.redirect('/login');
  })
})

router.get('/feed',isLoggedIn, async function(req, res) {

  var posts = await postModel.find({}).populate('userId').sort({date:-1});
  var users = await userModel.find({});
  res.render('feed', {footer: true,posts,users});
});

router.get('/profile',isLoggedIn, async function(req, res){

  var user = await userModel.findOne({_id:req.user._id}).populate('postId');

  let totalLikes = 0;

  for (var i=0;i<user.postId.length;i++) 
  {
    totalLikes+=user.postId[i].likes;
  }

  res.render('profile', {footer: true,user,totalLikes});
});

router.get('/search',isLoggedIn, async function(req, res) {
  var users = await userModel.find({});

  res.render('search', {footer: true,users});
});

router.get('/edit',isLoggedIn,async function(req, res) {
  var user = await userModel.findOne({_id:req.user._id});

  res.render('edit',{footer: true,user});
});

router.get('/upload',isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});

router.post('/register',function(req,res,next){
  var user = new userModel({
    username:req.body.username,
    name:req.body.name,
    email:req.body.email
  });

  userModel.register(user,req.body.password,function(err){
    if(err){
      console.error('Registration error:', err);
      return res.render('error', { error: err });
    }

    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile');
    })
  });


})

router.post('/login',passport.authenticate('local',{
  successRedirect:"/profile",
  failureRedirect:"/login"
}),function(req,res,next){

});

router.post('/edit',async function(req,res,next){
  const user = await userModel.findOne({_id:req.user._id});

  if(req.body.username) user.username = req.body.username;
  if(req.body.name) user.name = req.body.name;
  if(req.body.description) user.description = req.body.description;

  await user.save();
  res.redirect('/profile');
});

router.post('/deletePost/:id',isLoggedIn,async function(req,res,next){
  var postId = req.params.id;
  await postModel.deleteOne({_id:postId});
  res.redirect('/profile');
})

router.post('/dpUploads',upload.single('dp'),async function(req,res,next){
  var user = await userModel.findOne({_id:req.user._id});
  user.dpImage = req.file.filename;
  await user.save();
  res.redirect('/edit');
})

router.post('/CreatePost',upload.single('image'),async function(req,res,next){
  var user = await userModel.findOne({_id:req.user._id});

  var post = await postModel.create({
    caption:req.body.caption,
    imageUrl:req.file.filename,
    userId:req.user._id
  });

  user.postId.push(post._id);
  await user.save();
  res.redirect('/profile');
})

router.post('/updateLikes/:id',async function(req,res,next){
  var postid = req.params.id;
  var post = await postModel.findOne({_id:postid});
  post.likes = post.likes + 1;
  await post.save();
  
  var user = await userModel.findOne({_id:req.user._id});
  user.likedPost.push(postid);
  await user.save();

  res.json({name:"Harsh",lname:"Jain",postdata:post});
})

router.post('/LikedPostsData',async function(req,res,next){
  var user = await userModel.findOne({_id:req.user._id});
  var likedP = user.likedPost;

  res.json({likedPosts:likedP})
})

router.post('/reduceLikes/:id',async function(req,res,next){
  var postid = req.params.id;
  var post = await postModel.findOne({_id:postid});
  post.likes = post.likes - 1;
  await post.save();

  var user = await userModel.findOne({_id:req.user._id});
  var index = user.likedPost.indexOf(postid);
  user.likedPost.splice(index,1);
  await user.save();

  res.json({name:"Harsh"});
})

router.post('/search',async function(req,res,next){
  var userName = req.body.username;
  if(userName)
  {
    var user = await userModel.findOne({username:userName}).populate('postId');

    if(user)
    {
      let totalLikes = 0;
      for (var i=0;i<user.postId.length;i++) 
      {
        totalLikes+=user.postId[i].likes;
      }

      res.render('searchProfile',{footer:true,user,totalLikes});
    }
    else
    {
      res.redirect('/search');
    }
  }
  else
  {
    res.redirect('/search');
  }
})

router.post('/usernames/:user',async function(req,res,next){
  const regex = new RegExp(`^${req.params.user}`,'i');
  const users = await userModel.find({username:regex});
  res.json({users});

})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

module.exports = router;