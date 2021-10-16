const User = require('../models/User.model');
const {Subjects, createTopic} = require('../models/subjects.model');
const {registeredSubjects, createSubjectInstanceForEnrolling} = require('../models/registeredSubjects.model');
const bcrypt = require('bcryptjs');
const passport = require("passport");
const {outerUnion, innerUnion} = require('../utilities/getUnionFunctions.js');
const { create } = require('../models/User.model');
const  {generateQuestion, QuestionBank, checkQuestionsAnswer}= require('../models/Questions/questions.model');
const {quizData} = require('../models/Questions/users_quiz.model.js');
const {Reviews} = require('../models/reviews.model.js');
const questionBank_IntroQuestions = require('../models/Questions/introQuestions.js');


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

const postRegister = (req, res, next)=>{
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
  } 
  else {

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
                    newEntry.save().then(()=>{
                      passport.authenticate("userLocal", {
                        successRedirect: "/users/recommendationquiz",
                        failureRedirect: "/users/register",
                        failureFlash: true,
                      })(req, res, next);
                    })
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
    const deadline = req.params.deadline;
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

const enrollPostUser = (req, res) => {
  const userEmail = req.user.email;
    const subject = req.body.subjectToEnroll;
    const deadline = new Date(req.body.deadline);
    console.log(deadline);
    console.log("Enrolling");
    // console.log('email:', userEmail, 'subject:', subject, 'deadline:', deadline);

    Subjects.findOne({name: subject}).then((data)=>{
      const numberOfTopics = data.topics.length;
      const weeksLeft = Math.round((deadline.getTime() - new Date().getTime())/(7*24*60*60*1000));
      const MaxTopicsPerWeek = 3;
      var topicsPerWeek = Math.trunc(Math.ceil(parseFloat(numberOfTopics)/weeksLeft));
      console.log({weeksLeft, topicsPerWeek});
      if(topicsPerWeek == 0)
        topicsPerWeek = 1;
        
      if(topicsPerWeek > MaxTopicsPerWeek){
        res.redirect('/users/searchpage/')
        console.log("Topics Per Week Exceeded Max value of", MaxTopicsPerWeek);
        return;
      }

      var topicsList = [];

      data.topics.forEach(element=>{
        topicsList.push(element);
      })

      console.log({topicsList, topicsPerWeek});

      const weekMap = new Map();
      
      for(var j=0; ; j++){
        const thisWeek = parseInt(j+1);
        for(var i=0; i<topicsPerWeek; i++){
          if(weekMap.get(thisWeek) == undefined){
            weekMap.set(thisWeek, new Array());
          }
          weekMap.get(thisWeek).push(topicsList[0]);
          console.log("Size:", topicsList.length);
          topicsList.shift();
          console.log("after Popping, Size:", topicsList.length);

          if(topicsList.length <= 0)
            break;
          
        }
        if(topicsList.length <= 0)
          break;
      }

      console.log(weekMap);

      const toAdd = createSubjectInstanceForEnrolling(subject, weekMap, deadline)
      registeredSubjects.findOneAndUpdate({email: userEmail}, {$push: {subjects: toAdd}}, (error, success)=>{
        if (error) {
          console.log(error);
          res.redirect("/users/searchpage");
        } else {
          res.redirect("/users/coursepage/" + subject + '&1');
        }
      })

    });

    
}

const getCoursePage = (req, res) => {
  const subject = req.params.subject;
  const weekSelected = parseInt(req.params.week);

  
  registeredSubjects.findOne({email: req.user.email}).then((data, error)=>{
      if(error){
        console.log("Data retrival Failed");
        console.log(error);
        res.redirect('/users/dashboard');
      }
      else{
        let subjectsList = data.subjects;
        let schedule = [];
        for(var i=0; i<subjectsList.length; i++){
            if(subjectsList[i].name == subject)
            schedule = subjectsList[i].schedule;
        }
        
        // Map the topics to their corresponding weeks
        const map = new Map();
        schedule.forEach(element=>{
            const elementsWeek = parseInt(element.week);
            if(map.get(elementsWeek) == undefined){
              map.set(elementsWeek, new Array());
            }
            map.get(elementsWeek).push(element);
        })
        
        const totalWeeks = map.size;
        const topicsList = map.get(weekSelected);


        console.log('TopicsList:', topicsList[0].topics);
        
        registeredSubjects.findOne({email: req.user.email}).then((result, error)=>{
            let topicsCovered = [];
            result.subjects.forEach(element=>{
                if(element.name == subject){
                    topicsCovered = element.topicsCovered;
                }
            })
            res.render('users/coursePage.ejs', {
              user: req.user, 
              subject: subject, 
              weekSelected: weekSelected, 
              topicsList: topicsList[0].topics, 
              totalWeeks: totalWeeks,
              topicsCovered: topicsCovered,
              report: 'If you are done with the video, try a short quiz to see how well you have grasped the concepts',
            });
        });

        
      }
  });

}

const getQuizFromCoursePage = (req, res)=>{
    const subjectName = req.params.subject;
    const topicName = req.params.topic;
    const weekNo = req.params.week;

    QuestionBank.find({subject:subjectName, topic: topicName}).then((data,error)=>{
      if(error){
        console.log('error while fetching')
        res.redirect('users/coursepage/' + subjectName + '&' + weekNo);
      }
      else{
        let questionsList = [];

        data.forEach(element=>{
          questionsList.push(element.questions);
        })
        
        // Covenrt to 1D array
        questionsList = [].concat(...questionsList);;


        res.render("users/giveQuizFromCoursePage.ejs", {
            user: req.user,
            questionsList: questionsList,
            subject: subjectName,
            topic: topicName,
            weekNo: weekNo
        });
      }
    });
}

const postQuizFromCoursePage = (req, res)=>{
  let questionsList = JSON.parse(JSON.stringify(req.body))
  const email = req.user.email;

  const subject = questionsList[0].subject;
  const topic = questionsList[0].topic;

  var totalScore = 0, obtainedScore = 0;
  questionsList.forEach(question=>{
      totalScore++;
      if(question.optionChosen == question.correctAnswer)
        obtainedScore++;
  });

  quizData.findOne({email: email}).then((data, error)=>{
      if(error){
        console.log("Data Error");
      }
      else if(data){
        quizData.updateOne({email: email}, {$push: {quiz: [questionsList]}}).then((data,error)=>{
          if (error) {
            console.log(error, 'Quiz Info could not    saved');
          } else {
            console.log("Quiz Entry made");

            // Topic is Done
            if(parseFloat(obtainedScore)/totalScore * 100 > 80){
              console.log("Topic Is now Done");
              registeredSubjects.findOne({email: email}).then((data)=>{
                if(data){
                    const subjectsList = data.subjects;
                    console.log({subjectsList});
                    let topicsList = [], subjectToEdit;
                    subjectsList.forEach(subjectTouple=>{
                        if(subjectTouple.name == subject){
                          topicsList = subjectTouple.topicsCovered;
                          subjectToEdit = subjectTouple;
                        }
                    });

                    if(!topicsList.includes(topic)){

                        topicsList.push(topic);

                        subjectToEdit.topicsCovered = topicsList;

                        registeredSubjects.findOneAndUpdate({email: email}, {$pull: {subjects: {name: subject} }}).then((suc)=>{
                          registeredSubjects.findOneAndUpdate({email: email}, {$push: {subjects: subjectToEdit}}).then((succ)=>{
                              console.log("Topic Covered");
                          })
                        });
                    }
                }
                else{
                  console.log("error")
                }
              });
            }
            
          }
        })
      }
      else{
        const newEntry = new quizData();
        newEntry.email = email;
        newEntry.quiz.push(questionsList);
        newEntry.save().then((success, error)=>{
          if(error)
            console.log("Error When saving new Entry");
          else{
            console.log('Saved New Entry');
            const questions = success.quiz[0];

            // Topic is Done
            if(parseFloat(obtainedScore)/totalScore * 100 > 80){
              console.log("Topic Is now Done");
              registeredSubjects.findOne({email: email}).then((data)=>{
                if(data){
                    const subjectsList = data.subjects;
                    console.log({subjectsList});
                    let topicsList = [], subjectToEdit;
                    subjectsList.forEach(subjectTouple=>{
                        if(subjectTouple.name == subject){
                          topicsList = subjectTouple.topicsCovered;
                          subjectToEdit = subjectTouple;
                        }
                    });

                    if(!topicsList.includes(topic)){

                        topicsList.push(topic);

                        subjectToEdit.topicsCovered = topicsList;

                        registeredSubjects.findOneAndUpdate({email: email}, {$pull: {subjects: {name: subject} }}).then((suc)=>{
                          registeredSubjects.findOneAndUpdate({email: email}, {$push: {subjects: subjectToEdit}}).then((succ)=>{
                              console.log("Topic Covered");
                          })
                        });
                    }
                }
                else{
                  console.log("error")
                }
              });
            }
          }  
        })
      }
  })
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

          const subjectsToDisplay = innerUnion(allSubjects, registeredSubjectsList);
          const subjectsList = innerUnion(registeredSubjectsList, allSubjects);

          var subjectTopicMap = new Map();

          subjectsList.forEach(subject=>{
            subjectTopicMap.set(subject.name, subject.topics);
          })

          console.log({subjectsToDisplay, subjectsList})
         
          res.render("users/enrolledCoursesListPage.ejs", { user: req.user,  subjectsToDisplay: subjectsToDisplay, subjectTopicMap: subjectTopicMap});        
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
        
        registeredSubjects.updateOne( {email: eMail}, { $pull: {subjects: {name: subjectName} } }, (error, succ)=>{
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
  const subjectChosen = req.params.subject;
  var SubjectList = [];
  registeredSubjects.findOne({email: req.user.email}).then((data) => {
      SubjectList = data.subjects;
      if(subjectChosen == '--'){
        res.render("users/quizInfoPage.ejs", {
          user: req.user,
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
      res.render("users/quizInfoPage.ejs", {
        error: req.flash('error'),
        user: req.user,
        SubjectList: SubjectList,
        chosenSubject: subjectChosen,
        topicsList: subjectTouple.topicsCovered
    });

  }).catch(() => {
    res.render("users/quizInfoPage.ejs", {
      user: req.user,
      SubjectList: SubjectList,
      chosenSubject: [],
      topicsList: []
    });
});
}


const postQuizInfoPage = (req, res) => {
  const {subjectname, topicname} = req.body;

  res.redirect('/users/quizapp/' + subjectname + '&' + topicname);
  
}

const getRecommendationQuizPage = (req,res) => {
  console.log("RecommendationPage Reached");
  questionBank_IntroQuestions.find().then((data, err)=>{
    if(err){
      console.log("Data Error");
      res.redirect('/');
    }
    else{
      const questionsList = data.sort((a, b) => 0.5 - Math.random()).slice(0,15);
      console.log(questionsList)
      res.render("users/recommendationQuizPage.ejs", {
        user: req.user,
        questionsList: questionsList
      });
    }
    
  })
}

const postRecommendationQuizPage = (req,res) => {
  console.log("Post RecommendationPage Reached");

  let questionsList = JSON.parse(JSON.stringify(req.body))
  const email = req.user.email;

  console.log({questionsList, email});

  let map = new Map();
  questionsList.forEach(question=>{
    const thisSubject = question.subject;
    if(map.get(thisSubject) == undefined){
      map.set(thisSubject, {
          score: parseInt(0),
          total: parseInt(0)
      });      
    }

    // Correct Answer
    if(question.optionChosen == question.correctAnswer){
      map.get(thisSubject).score++;
    }
    map.get(thisSubject).total++;
  });
  

  var subjectsAccuracyList = [];
  map.forEach((value,key)=>{
    subjectsAccuracyList.push({
      subject: key,
      accuracy: parseFloat(value.score)/value.total * 100
    });
  });
  
  console.log({subjectsAccuracyList});
  
  // questionBank_IntroQuestions.find().then((data, err)=>{
  //   if(err){
  //     console.log("Data Error");
  //     res.redirect('/');
  //   }
  //   else{
  //     const questionsList = data.sort((a, b) => 0.5 - Math.random()).slice(0,10);
  //     console.log(questionsList)
  //     res.render("users/recommendationQuizPage.ejs", {
  //       user: req.user,
  //       questionsList: questionsList
  //     });
  //   }
  // })
}

const getQuiz = (req, res) => {
    const subjectname = req.params.subject;
    const topicname = req.params.topic;

    if(topicname == 'All Topics'){
      QuestionBank.find({subject:subjectname}).then((data,error)=>{
        if(error){
           console.log('error while fetching')
           res.render("users/giveQuizPage.ejs", {
             user: req.user,
             questionsList: []
           });   
        }
        else{
           let questionsList = [];
 
           data.forEach(element=>{
             questionsList.push(element.questions);
           })
           
           // Covenrt to 1D array
           questionsList = [].concat(...questionsList);
           
           // Randomise and get 10 questions
           questionsList = questionsList.sort((a, b) => 0.5 - Math.random()).slice(0,10);

           
           res.render("users/giveQuizPage.ejs", {
               user: req.user,
               questionsList: questionsList
           });
        }
      })
      return;
    }

    QuestionBank.find({subject:subjectname, topic: topicname}).then((data,error)=>{
      if(error){
        console.log('error while fetching')
        res.render("users/giveQuizPage.ejs", {
          user: req.user,
          questionsList: []
        });   
      }
      else{
        let questionsList = [];

        data.forEach(element=>{
          questionsList.push(element.questions);
        })
        
        // Covenrt to 1D array
        questionsList = [].concat(...questionsList);;


        res.render("users/giveQuizPage.ejs", {
            user: req.user,
            questionsList: questionsList
        });
      }
    })
}

const getuserInfoUpdate = (req, res) => {
  
  res.render("users/userInfoUpdate.ejs",{ user: req.user});   

}

const getReviewForm = (req, res) => {
  
  res.render("users/reviewFormPage.ejs",{ user: req.user});   

}

const postCheckQuiz = (req, res) => {

  let questionsList = JSON.parse(JSON.stringify(req.body))
  const email = req.user.email;

  quizData.findOne({email: email}).then((data, error)=>{
      if(error){
        console.log("Data Error");
      }
      else if(data){
        quizData.updateOne({email: email}, {$push: {quiz: [questionsList]}}).then((data,error)=>{
          if (error) {
            console.log(error, 'Quiz Info could not    saved');
          } else {
            console.log("Quiz Entry made");
          }
        })
      }
      else{
        const newEntry = new quizData();
        newEntry.email = email;
        newEntry.quiz.push(questionsList);
        newEntry.save().then((success, error)=>{
          if(error)
            console.log("Error When saving new Entry");
          else
            console.log('Saved New Entry');
        })
      }
  })
  
  // registeredSubjects.findOneAndUpdate({email: userEmail}, {$push: {subjects: toAdd}}, (error,success)=>{
  //   if (error) {
  //     console.log(error);
  //     res.redirect("/users/dashboard");
  //   } else {
  //     res.redirect("/users/searchpage");
  //   }
  // })

  // res.render("users/CheckQuizPage.ejs", {
  //     user: req.user,
  //     questionsList: questionsList
  // });
  

}


const postUpdateUser =  (req, res)=>{
  const {name, email,CurrentPassword,NewPassword,ReTypeNewPassword} = req.body;
  console.log({name, email,CurrentPassword,NewPassword,ReTypeNewPassword});



  if(NewPassword != ReTypeNewPassword){
    res.redirect('users/userInfoUpdate');
    return;
  }

  User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "This email is not registered",
            });
          } else {
           
            bcrypt.genSalt(10, (err, salt) => {
              if (err) {
                res.redirect("/users/register");
              } else {
                bcrypt.hash(NewPassword, salt, (err, hash) => {
                  if (err) {
                    res.redirect("/users/register");   
                  } 

                  //Match Password
                  else {
                      User.findOneAndUpdate({email: email}, {name: name, password: hash}).then((data)=>{
                        if(data){
                          console.log("SuccessFul Update", data);
                          res.redirect("/users/userInfoUpdate"); 
                        }
                        else{
                          console.log("UnsuccessFul Update", data);
                          res.redirect("/users/userInfoUpdate"); 
                        }
                      })
                  }
                });
              }
            });
          }
  
  });
}


const postReview = (req, res) => {
    const {message} = req.body;
    console.log(message);
    Reviews.findOne({email: req.user.email}).then((data, error)=>{
      if(error){
          console.log("Error when finding Data", error);
          res.redirect('/users/dashboard');
      }
      else if(data){
        console.log('User Already has a review so we are replacing');
        Reviews.findOneAndUpdate({email: req.user.email}, {text: message}).then(()=>{res.redirect('/users/dashboard')}).catch((error)=>{
            console.log(error);
        });

      }
      else{
        const newEntry = new Reviews();
        newEntry.email = req.user.email;
        newEntry.name = req.user.name;
        newEntry.text = message;
        newEntry.save().then((data, error)=>{
          if(error){
            console.log("Could not save new data");
          }else{
            console.log('Data Saved');
          }
          res.redirect('/users/dashboard');
        })
      }
    });
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
    enrollPostUser,
    getEnrolledCoursesPage,
    unregisterCourse,
    getQuizInfoPage,
    postQuizInfoPage,
    getQuizFromCoursePage,
    getQuiz,
    getuserInfoUpdate,
    postCheckQuiz,
    postUpdateUser,
    getReviewForm,
    postReview,
    getRecommendationQuizPage,
    postRecommendationQuizPage,
    postQuizFromCoursePage
};