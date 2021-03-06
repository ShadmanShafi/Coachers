const express = require("express");
const router = express.Router();
const ensureAuthenticated = require('./../middlewares/auth.middleware');
const { getLogin,deleteintroquestion,getViewIntroQuestion,getViewQuestion,gettopiclist,postaddtopics,getaddtopics,getaddsubject, postaddsubject, getRegister, postLogin, postRegister, getDashboard, getLandingPage, getUserList, registerNewUser, deleteUser, deleteTopic, getDeleteSubjectPage, postDeleteSubject, getAddQuestion, postAddQuestion, getAddintroQuestion, postAddintroQuestion } = require('./../controllers/admin.controller');

router.get("/login", getLogin);
router.get("/addsubject",getaddsubject);
router.get("/addtopics",getaddtopics);
router.post("/addtopics",postaddtopics);
router.post("/login", postLogin);
router.post("/addsubject", postaddsubject);
router.get("/register", getRegister);
router.post("/register", postRegister);
router.get("/userlist", getUserList);
router.get("/topiclist/:subject", gettopiclist);
router.get("/deletetopic/:topic&:subject", deleteTopic);
router.get("/registernewuser", registerNewUser);
router.get("/deleteuser/:id", deleteUser);

router.get("/deletesubject", getDeleteSubjectPage);
router.post("/deletesubject", postDeleteSubject);

router.get('/addquestion/:subject', getAddQuestion);
router.post('/addquestion', postAddQuestion)

router.get('/addintroquestion', getAddintroQuestion);
router.post('/addintroquestion', postAddintroQuestion);
router.get('/viewquestion', getViewQuestion);
router.get('/viewintroquestion', getViewIntroQuestion);
router.get("/deleteintroquestion/:id", deleteintroquestion);




router.get("/logout",(req, res)=>{
    req.logout();
    res.redirect("/admin");
});

router.get("/dashboard", ensureAuthenticated, getDashboard);

router.get("/", getLandingPage);

module.exports = router;
