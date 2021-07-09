const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('./../middlewares/auth.middleware');

router.get("/",(req, res)=>{
    res.sendFile('landingpage.html',{root:"./landingpage"})
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


module.exports = router; 