const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const {Subjects, createTopic} = require('../models/subjects.model');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const {generateQuestion, QuestionBank, checkQuestionsAnswer} = require('../models/Questions/questions.model')
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
  Subjects.findOne({ name: subjectname }).then((subject) => {
    if (subject) {
      errors.push("Subject already exists with this email!");
      req.flash("errors", errors);
      res.redirect("/admin/addsubject");
    } else {
      const newSubject = new Subjects();
      newSubject.name = subjectname;
      newSubject
        .save()
        .then(() => {
          console.log("Saving Subject Success");
          res.redirect("/admin/addsubject");
        })
        .catch(() => {
          errors.push("Saving subject to the database failed!");
          req.flash("errors", errors);
          res.redirect("/admin/addsubject");
          console.log("Saving Subject Failed");
        });
    };
})};

const getaddtopics = (req,res) => {
  var SubjectList = [];
  Subjects.find().then((data) => {
        SubjectList = data;
        res.render("admin/addtopicspage.ejs", {
          SubjectList: SubjectList,
        });
  }).catch(() => {
        res.render("admin/addtopicspage.ejs", {
          SubjectList: SubjectList,
        });
  })
  // res.render("admin/addtopicspage.ejs", {SubjectList})

}

const postaddtopics = (req, res) => {
  const { subjectname, topic, week, link, description } = req.body;
  console.log({ subjectname, topic, week, link, description });

  const toAdd = createTopic(topic, week, link, description);
  Subjects.findOneAndUpdate({name: subjectname}, {$push: {topics: toAdd}}, (error,success)=>{
    if (error) {
      console.log(error);
      res.redirect("/admin/addtopics");
    } else {
      console.log(success);
      res.redirect("/admin/addtopics");
    }
  });
  
  
}
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
  let SubjectList = [];

  let subjectName = req.params.subject;

  Subjects.find().then((data) => {
    SubjectList = data;
    if(subjectName == '--'){
      res.render('admin/viewtopicspage.ejs', {
        error: req.flash('error'),
        SubjectList: SubjectList,
        chosenSubject: [],
        topicsList: []
      })
      return;
    }
    let subjectTouple;
    SubjectList.forEach(subject=>{
        if(subject.name == subjectName){
            subjectTouple = subject;
        }
    })

    console.log(subjectTouple.topics);

    res.render("admin/viewtopicspage.ejs", {
          error: req.flash('error'),
          SubjectList: SubjectList,
          chosenSubject: subjectName,
          topicsList: subjectTouple.topics
    });
  }).catch(() => {
    error = 'Failed to fetch data';
    res.render("admin/viewtopicspage.ejs", {
          error: req.flash('error', error),
          SubjectList: SubjectList,
          topicsList: [],
          chosenSubject: null,
    });
  })
  
}




const deleteTopic = (req, res) => {
  const topicName = req.params.topic;
  const subjectName = req.params.subject;

  console.log(req.params.id);
  Subjects.findOneAndUpdate({name: subjectName}, {$pull: {topics: {topicName:topicName}}}, (error,success)=>{
    if(error){
      console.log(error);
      error = "Data Delete unsuccessful.";
      console.log(error);
      req.flash('error', error);
      res.redirect('/admin/topiclist/'+subjectName);
    }
    else{
      console.log(success);
      error = "Data Deleted Successfully.";
      console.log(error);
      req.flash('error', error);
      res.redirect('/admin/topiclist/'+subjectName);
    }
  });
}


const getDeleteSubjectPage = (req, res) => {
  var SubjectList = [];
  Subjects.find().then((data) => {
        SubjectList = data;
        res.render("admin/deleteSubjectPage.ejs", {
          SubjectList: SubjectList,
        });
  }).catch(() => {
        res.render("admin/deleteSubjectPage.ejs", {
          SubjectList: SubjectList,
        });
  })
  // res.render("admin/addtopicspage.ejs", {SubjectList})

}


const postDeleteSubject = (req, res) => {
  const {subjectname} = req.body;
  console.log(subjectname);
  Subjects.findOneAndDelete({name: subjectname}).then((success, error)=>{
    if(error){
      console.log("Delete Failed");
    }
    else{
      console.log("Delete Successful");
    }
    res.redirect('/admin/deletesubject')
  });

}

const getAddQuestion = (req, res) => {
  const subjectChosen = req.params.subject;
  var SubjectList = [];
  Subjects.find().then((data) => {
        SubjectList = data;
        if(subjectChosen == '--'){
          res.render("admin/addQuestionPage.ejs", {
            SubjectList: SubjectList,
            chosenSubject: subjectChosen,
            topicsList: []
          });
          return;
        }
        let subjectTouple;
        SubjectList.forEach(subject=>{
            if(subject.name == subjectChosen){
                subjectTouple = subject;
            }
        })
        res.render("admin/addQuestionPage.ejs", {
              error: req.flash('error'),
              SubjectList: SubjectList,
              chosenSubject: subjectChosen,
              topicsList: subjectTouple.topics
        });

  }).catch(() => {
        res.render("admin/addQuestionPage.ejs", {
          SubjectList: SubjectList,
          chosenSubject: [],
          topicsList: []
        });
  });
}

const postAddQuestion = (req, res) => {
  const {subjectname, topicname, question, optionA, optionB, optionC, optionD, correctOption} = req.body;
  console.log( {subjectname, topicname, question, optionA, optionB, optionC, optionD, correctOption} );
  const questionToAdd = generateQuestion(question, optionA, optionB, optionC, optionD, correctOption, subjectname, topicname);
  QuestionBank.findOne({subject: subjectname, topic: topicname}).then((data,error)=>{
    if(error){
      console.log("Data Error");
    }
    else if(data){
      console.log("Data Found");
      QuestionBank.findOneAndUpdate({subject: subjectname, topic: topicname}, {$push: {questions: questionToAdd}}, (error,success)=>{
          if(error){
            console.log('Error When updating');
          }
      })
    }
    else{
      const newEntry = new QuestionBank();
      newEntry.subject = subjectname;
      newEntry.topic= topicname;
      newEntry.questions.push(questionToAdd);
      newEntry.save().then((error)=>{
          console.log("New Question Entry Saved");
      }).catch((e)=>{
          console.log("New Question Entry Error:", e);
      })
    }

  })

  
  res.redirect('/admin/addquestion/--')
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
    deleteTopic,
    getDeleteSubjectPage,
    postDeleteSubject,
    getAddQuestion,
    postAddQuestion
};