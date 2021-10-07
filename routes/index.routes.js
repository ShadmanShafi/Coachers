const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('./../middlewares/auth.middleware');
const generateQuestionList = require('./../models/Questions/questions.model.js');

router.get("/",(req, res)=>{
    res.render('landingpage.ejs')
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
    res.render("dashboard.ejs", { user: req.user });
});

router.get("/aptitude", ensureAuthenticated, (req, res) => {
    res.render("aptitude.ejs", { user: req.user });
});

router.get("/overview", ensureAuthenticated, (req, res) => {
  res.render("overview.ejs", { user: req.user });
});

router.get("/selection", ensureAuthenticated, (req, res) => {
  res.render("selection.ejs", { user: req.user });
});

router.get("/subjectPhysics", ensureAuthenticated, (req, res) => {
  res.render("subjectPhysics.ejs", { user: req.user });
});

router.get("/suggestion", ensureAuthenticated, (req, res) => {
  res.render("suggestion.ejs", { user: req.user });
});

router.get("/aptitude", ensureAuthenticated, (req, res) => {
  res.render("aptitude.ejs", { user: req.user });
});

router.get("/test", (req, res) => {

  //Req will contain the tags of the required questions
  //const questionList = generateQuestionList(req.tag);
  res.sendFile('quiz.html',{root:"./quiz"});
});

router.get('/demovideo', (req,res) => {
  res.sendFile('videopage.html',{root:"./videopage"});
});


router.get('/about', (req, res) => {
  
})

router.get('/contactus', (req, res) => {
  
})

router.get('/reviews', (req, res) => {
  
})




module.exports = router; 