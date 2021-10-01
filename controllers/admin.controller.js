const Admin = require('../models/Admin.model');
const Subjects = require('../models/subjects.model');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const Topics = require('../models/Topics.model');


const getDashboard = (req,res) => {
    res.render("admin/dashboard.ejs");
}

const getaddtopics = (req,res) => {
  // let SubjectList = [];
  // Subjects.find().then((data) => {
  //       SubjectList = data;
  //       console.log("Data found\n");
  //       res.render("admin/addtopicspage.ejs", {
  //         options: SubjectList
  //       });
  // }).catch(() => {
  //       res.render("admin/addtopicspage.ejs", {
  //           options: {NULL}
  //       });
  // })


  res.render("admin/addtopicspage.ejs");
}
const getLogin = (req, res)=>{
    res.render("admin/login.ejs", {error: req.flash("error")});
};

const getaddsubject = (req, res)=>{
  res.render("admin/addsubjectpage.ejs", {error: req.flash("error")});
};

const postLogin = (req, res, next) => {
    console.log("Admin Logging In");
    passport.authenticate("local", {
      successRedirect: "/admin/dashboard",
      failureRedirect: "/admin/login",
      failureFlash: true,
    })(req, res, next);
};
const postaddsubject = (req, res) => {
  const { subjectname } = req.body;
  const errors = [];
  Subjects.findOne({ subjectname: subjectname }).then((subject) => {
    if (subject) {
      errors.push("Subject already exists with this email!");
      req.flash("errors", errors);
      res.redirect("/admin/addsubject");
    } else {
      const newSubject = new Subjects({
        subjectname,

      });
      newSubject
        .save()
        .then(() => {
          res.redirect("/admin/addsubject");
        })
        .catch(() => {
          errors.push("Saving subject to the database failed!");
          req.flash("errors", errors);
          res.redirect("/admin/addsubject");
        });
    };
})};

const postaddtopics = (req, res) => {
  const { subjectname, topic  } = req.body;
  const errors = [];
  Topics.findOne({ topic: topic }).then((topic) => {
    if (topic) {
      errors.push("topic already exists with this email!");
      req.flash("errors", errors);
      res.redirect("/admin/addtopics");
    } else {
      const newtopic = new Topics({
        subjectname,
        topic

      });
      newtopic
        .save()
        .then(() => {
          res.redirect("/admin/addtopics");
        })
        .catch(() => {
          errors.push("Saving topics to the database failed!");
          req.flash("errors", errors);
          res.redirect("/admin/addtopics");
        });
    };
})};

const getRegister = (req, res)=>{
    res.render("admin/register.ejs", {errors:req.flash('errors')});
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
        res.redirect("/admin/register");
    } else {

//Create New User
Admin.findOne({ email: email }).then((user) => {
    if (user) {
      errors.push("Admin already exists with this email!");
      req.flash("errors", errors);
      res.redirect("/admin/register");
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          errors.push(err);
          req.flash("errors", errors);
          res.redirect("/admin/register");
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              errors.push(err);
              req.flash("errors", errors);
              res.redirect("/admin/register");
            } else {
              const newUser = new Admin({
                name,
                email,
                password: hash,
              });
              newUser
                .save()
                .then(() => {
                  res.redirect("/admin/login");
                })
                .catch(() => {
                  errors.push("Saving User to the database failed!");
                  req.flash("errors", errors);
                  res.redirect("/admin/register");
                });
            }
          });
        }
      });
    }
  });
  }
};

const getLandingPage = (req,res) => {
    res.render("admin/landingPage.ejs")
}

const getUserList = (req, res) => {
    res.render("admin/userlist.ejs");
}

module.exports = {
    getLogin,
    getRegister,
    postLogin,
    postRegister,
    getDashboard,
    getLandingPage,
    getaddsubject,
    postaddsubject,
    getaddtopics,
    postaddtopics,
    getUserList
};