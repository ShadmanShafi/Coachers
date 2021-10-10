const User = require('../models/User.model');
const {Subjects, createTopic} = require('../models/subjects.model');
const {registeredSubjects, createSubjectInstanceForEnrolling} = require('../models/registeredSubjects.model');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const {outerUnion, innerUnion} = require('../utilities/getUnionFunctions.js');
const { create } = require('../models/User.model');

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
                  let newEntry = new registeredSubjects();
                  newEntry.email = newUser.email;
                  newEntry.subjects = [];
                  newEntry.save().then(()=>{res.redirect("/users/login");})
                  
                })
                .catch((e) => {
                  errors.push("Saving User to the database failed!");
                  console.log(e);
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
  const userEmail = req.user.email;
  registeredSubjects.findOne({email: userEmail}, (err, data)=>{
    res.render("users/dashboard.ejs", { user: req.user, subjectsRegistered: data.subjects });
  }).catch((error)=>{
    console.log(error);
    res.render("users/dashboard.ejs", { user: req.user,  subjectsRegistered: []});
  });
  
}

const getSearchPage = (req, res) => {
  Subjects.find().then((data)=>{
    const allSubjects = data;
    registeredSubjects.findOne({email: req.user.email}, (error, registeredSubjectsListData)=>{
        if(error){
          console.log("DataBase Error. Subjects Junction Table: NO DATA\n");
          res.redirect("/users/dashboard");
        }
        else{
          const registeredSubjectsList = registeredSubjectsListData.subjects;

          const subjectsToDisplay = outerUnion(registeredSubjectsList, allSubjects);

         
          res.render("users/searchPage.ejs", { user: req.user,  subjectsList: subjectsToDisplay});
        }
    })
    
  }).catch((error)=>{
      console.log(error);
      res.render("users/searchPage.ejs", { user: req.user,  subjectsList: []});
    }
  )
}


const enrollUser = (req, res) => {
    const userEmail = req.params.useremail;
    const subject = req.params.subject;
    console.log("Enrolling");
    console.log(userEmail, subject);

    const toAdd = createSubjectInstanceForEnrolling(subject)
    registeredSubjects.findOneAndUpdate({email: userEmail}, {$push: {subjects: toAdd}}, (error,success)=>{
      if (error) {
        console.log(error);
        res.redirect("/users/dashboard");
      } else {
        res.redirect("/users/searchpage");
      }
    })
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

const getEnrolledCoursesPage = (req, res) => {
  Subjects.find().then((data)=>{
    const allSubjects = data;
    registeredSubjects.findOne({email: req.user.email}, (error, registeredSubjectsListData)=>{
        if(error){
          console.log("DataBase Error. Subjects Junction Table: NO DATA\n");
          res.redirect("/users/dashboard");
        }
        else{
          const registeredSubjectsList = registeredSubjectsListData.subjects;

          const subjectsToDisplay = innerUnion(registeredSubjectsList, allSubjects);

         
          res.render("users/enrolledCoursesListPage.ejs", { user: req.user,  subjectsList: subjectsToDisplay});        
        }
    })
    
  }).catch((error)=>{
      console.log(error);
      res.render("users/enrolledCoursesListPage.ejs", { user: req.user,  subjectsList: []});    }
  )
  
}

const unregisterCourse = (req, res) => {
    const eMail = req.user.email;
    const subjectName = req.params.subject;
    registeredSubjects.findOne({email: eMail}, (error, registeredSubjectsListData)=>{
      if(error){
        console.log("DataBase Error. Subjects Junction Table: NO DATA\n");
        res.redirect("/users/dashboard");
      }
      else{
        
        registeredSubjects.updateOne( {email: eMail}, { $pull: {subjects: subjectName } }, (error, succ)=>{
          if(error){
            console.log("Error Found\n");
            res.redirect("/users/enrolledcourselist"); 
          }
          else{
            res.redirect("/users/enrolledcourselist"); 
          }
        });
      }
  });
  
}

const getQuizInfoPage = (req, res) => {
  
    res.render("users/quizInfoPage.ejs", { user: req.user,  subjectsList: []});   

}


module.exports = {
    getLogin,
    getRegister,
    postLogin,
    postRegister,
    getDashboard,
    getSearchPage,
    getCoursePage,
    enrollUser,
    getEnrolledCoursesPage,
    unregisterCourse,
    getQuizInfoPage

};