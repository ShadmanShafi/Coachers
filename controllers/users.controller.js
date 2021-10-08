const User = require('../models/User.model');
const Subjects = require('../models/subjects.model');
const bcrypt = require('bcryptjs');
const passport = require("passport");

const getLogin = (req, res)=>{
    res.render("users/login.ejs", {error: req.flash("error")});
};

const postLogin = (req, res, next) => {
    passport.authenticate("userLocal", {
      successRedirect: "/users/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true,
    })(req, res, next);
  };

const getRegister = (req, res)=>{
    res.render("users/register.ejs", {errors:req.flash('errors')});
};

const postRegister = (req, res)=>{
    const { name, email, password, confirm_password } = req.body;

//Data Validation
    const errors = [];
    if (!name || !email || !password || !confirm_password) {
        errors.push("All fields are required!");
    }
    if (password.length < 6) {
        errors.push("Password must be at least 6 characters!");
    }
    if (password !== confirm_password) {
        errors.push("Passwords do not match!");
    }
    if (errors.length > 0) {
        req.flash("errors", errors);
        res.redirect("/users/register");
    } else {

//Create New User
User.findOne({ email: email }).then((user) => {
    if (user) {
      errors.push("User already exists with this email!");
      req.flash("errors", errors);
      res.redirect("/users/register");
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          errors.push(err);
          req.flash("errors", errors);
          res.redirect("/users/register");
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              errors.push(err);
              req.flash("errors", errors);
              res.redirect("/users/register");
            } else {
              const newUser = new User({
                name,
                email,
                password: hash,
              });
              newUser
                .save()
                .then(() => {
                  res.redirect("/users/login");
                })
                .catch(() => {
                  errors.push("Saving User to the daatabase failed!");
                  req.flash("errors", errors);
                  res.redirect("/users/register");
                });
            }
          });
        }
      });
    }
  });
  }
};

const getDashboard = (req, res) => {
  res.render("users/dashboard.ejs", { user: req.user });
}

const getSearchPage = (req, res) => {
  Subjects.find().then((data)=>{
    res.render("users/searchPage.ejs", { user: req.user,  subjectsList: data});
  }).catch((error)=>{
      console.log(error);
      res.render("users/searchPage.ejs", { user: req.user,  subjectsList: []});
    }
  )
}


const enrollUser = (req, res) => {
    const userId = req.params.userid;
    const subject = req.params.subjectid;
    console.log("Enrolling");
    console.log(userId, subject);
}

const getCoursePage = (req, res) => {
  let subjectsList = [];
  Subjects.find().then((data)=>{
    subjectsList = data;
  }).catch((error)=>{
      console.log(error);
    }
  )
  
  res.render("users/coursePage.ejs", { user: req.user,  subjectsList: subjectsList});
}



module.exports = {
    getLogin,
    getRegister,
    postLogin,
    postRegister,
    getDashboard,
    getSearchPage,
    getCoursePage,
    enrollUser
};