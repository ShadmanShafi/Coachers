const express = require("express");
const router = express.Router();
const { getLogin,getQuiz,getCheckQuiz,getuserInfoUpdate ,getRegister, postLogin, postRegister, getDashboard, getSearchPage, getCoursePage, enrollUser, getEnrolledCoursesPage, unregisterCourse, getQuizInfoPage, postQuizInfoPage } = require('./../controllers/users.controller');
const ensureAuthenticated = require('./../middlewares/auth.middleware');

router.get("/login",getLogin);
router.post("/login",postLogin);
router.get("/register",getRegister);
router.post("/register",postRegister);
router.get("/logout",(req, res)=>{
    req.logout();
    res.redirect("/");
});

router.get("/dashboard", ensureAuthenticated, getDashboard);
router.get("/searchpage", ensureAuthenticated, getSearchPage);
router.get("/coursepage/:subject&:week", ensureAuthenticated, getCoursePage);
router.get("/enrolledcourselist", ensureAuthenticated, getEnrolledCoursesPage);
router.get("/enroll/:useremail&:subject", ensureAuthenticated, enrollUser);
router.get("/unregistercourse/:subject", ensureAuthenticated, unregisterCourse);
router.get("/userInfoUpdate", ensureAuthenticated,getuserInfoUpdate );

router.get("/quiz/:subject", ensureAuthenticated, getQuizInfoPage);


router.post("/quiz", ensureAuthenticated, postQuizInfoPage);

router.get("/quizapp/:subject&:topic", ensureAuthenticated, getQuiz);
router.get("/checkquiz/:questionarray&:resultarray", ensureAuthenticated, getCheckQuiz);


module.exports = router;