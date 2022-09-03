const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// require("dotenv").config();
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
// const { compareSync } = require("bcrypt");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: 'Our little Secret',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);


// userSchema.plugin(encrypt,{ secret:process.env.SECRET,encryptedFields:['password'] });

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username
      
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});


app.get("/register", function (req, res) {
  res.render("register");
});

app.get('/secrets',function(req,res){
  if(req.isAuthenticated()){
    res.render('secrets')
  }else{
    res.redirect('/login')
  }
})

app.get('/logout',function(req,res){
  req.logout(function(err){
    if(err){
      console.log(err)
    }else{
      res.redirect('/');
    }
  });
  
})

app.post("/register", function (req, res) {

  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err)
      res.redirect('/register')
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect('/secrets')
      })
    }
  })




  

//   bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
//     const newUser = new User({
//       email: req.body.username,
//       password: hash,
//     });
//     newUser.save(function (err) {
//       if (err) {
//         console.log(err);
//       } else {
//         res.render("secrets");
//       }
//     });
//   });
});

app.post("/login", function (req, res) {

  const user = new User ({ 
    username: req.body.username,
    password:req.body.password

  })

  req.login(user,function(err){
    if(err){
      console.log(err)
    }else{
      passport.authenticate('local')(req,res,function(){
        res.redirect('/secrets')
      })
    }
  })
//   const username = req.body.username;
//   const password = req.body.password;

//   User.findOne({ email: username }, function (err, findUser) {
//     if (err) {
//       console.log(err);
//     } else {
//       if (findUser) {
//         bcrypt.compare(password, findUser.password, function (err, result) {
//           if (result === true) {
//             res.render("secrets");
//           } else {
//             res.send(err);
//           }
//         });
//       }
//     }
//   });
});

app.listen(3000, function () {
  console.log("listening to port 3000");
});
