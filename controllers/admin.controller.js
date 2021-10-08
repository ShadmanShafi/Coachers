const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const Subjects = require('../models/subjects.model');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const Topics = require('../models/Topics.model');
const { render } = require('ejs');


const getDashboard = (req,res) => {
    res.render("admin/dashboard.ejs");
}

const getLogin = (req, res)=>{
    res.render("admin/login.ejs", {error: req.flash("error")});
};

const getaddsubject = (req, res)=>{
  res.render("admin/addsubjectpage.ejs", {error: req.flash("error")});
};

const postLogin = (req, res, next) => {
    console.log("Admin Logging In");
    passport.authenticate("adminLocal", {
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

const getaddtopics = (req,res) => {
  var SubjectList = [];
  Subjects.find().then((data) => {
        SubjectList = data;
        res.render("admin/addtopicspage.ejs", {
          SubjectList: SubjectList,
          size: SubjectList.legnth
        });
  }).catch(() => {
        res.render("admin/addtopicspage.ejs", {
          SubjectList: SubjectList,
          size: SubjectList.legnth
        });
  })
  // res.render("admin/addtopicspage.ejs", {SubjectList})

}

const postaddtopics = (req, res) => {
  const { subjectname, topic  } = req.body;
  console.log({ subjectname, topic  });

  const errors = [];
  Topics.findOne({ topic: topic, subjectname: subjectname }).then((element) => {
    if (element) {
      errors.push("topic already exists!");
      console.log("topic already exists!");
      req.flash("errors", errors);
      res.redirect("/admin/addtopics");
    } else {
      const newtopic = new Topics();

      Subjects.findOne({subjectname: subjectname}).then((result) => {
        if(result){
          console.log("Going in", result._id);
          const subjectID = result._id;
          
          newtopic.name = topic;
          newtopic.subject = (subjectID);
          newtopic
          .save()
          .then(() => {
          console.log('Saving topic to the database Successful!');
          res.redirect("/admin/addtopics");
        })
        .catch((e) => {
          errors.push("Saving topic to the database failed!");
          console.log(errors);
          console.log(e);
          req.flash("errors", errors);
          res.redirect("/admin/addtopics");
        });

        }
        else{
          console.log("Subject Error. Not Found.");
          return;
        }
    })
  

      
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
  let allUsers = [];
  User.find().then((data) => {
    allUsers = data;
    res.render("admin/userList.ejs", {
          error: req.flash('error'),
          participants: allUsers
    });
  }).catch(() => {
    error = 'Failed to fetch data';
    res.render("admin/userList.ejs", {
          error: req.flash('error', error),
          participants: allUsers
    });
  })
}

const registerNewUser = (req, res) => {
  const errors = [];
  res.render("admin/registerNewUserPage.ejs", {errors:errors});
}

const deleteUser = (req, res) => {
  const id = req.params.id;
  User.deleteOne({_id:id}, (err)=>{
      if(err){
          error = "failed to delete data";
          req.flash('error', error);
          res.redirect('/admin/userlist');
      }else{
          error = "Data Deleted Successfully.";
          req.flash('error', error);
          res.redirect('/admin/userlist');
      }
  });
}


const gettopiclist = (req, res) => {
  let alltopics = [];
  Topics.aggregate([{
    $lookup: {
        from: "subjects", // collection name in db
        localField: "subject",
        foreignField: "_id",
        as: "subject_topic_list"
    }
  }]).exec(function(err, topicList) {
    console.log(topicList)
    alltopics = topicList;
    
    res.render("admin/viewtopicspage.ejs", {
        error: req.flash('error'),
        participants: alltopics
    });
  });


  // Topics.find().then((data) => {
  //   alltopics = data;
  //   console.log(alltopics);
  //   res.render("admin/viewtopicspage.ejs", {
  //         error: req.flash('error'),
  //         participants: alltopics
  //   });
  // }).catch(() => {
  //   error = 'Failed to fetch data';
  //   console.log(alltopics);
  //   res.render("admin/viewtopicspage.ejs", {
  //         error: req.flash('error', error),
  //         participants: alltopics
  //   });
  // })
  
}

const deleteTopic = (req, res) => {
  const id = req.params.id;
  Topics.deleteOne({_id:id}, (err)=>{
      if(err){
          error = "failed to delete data";
          req.flash('error', error);
          res.redirect('/admin/topiclist');
      }else{
          error = "Data Deleted Successfully.";
          req.flash('error', error);
          res.redirect('/admin/topiclist');
      }
  });
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
    gettopiclist,
    getaddtopics,
    postaddtopics,
    getUserList,
    registerNewUser,
    deleteUser,
    deleteTopic
};