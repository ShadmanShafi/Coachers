const express = require("express");
const router = express.Router();
const ensureAuthenticated = require('./../middlewares/auth.middleware');
const { getLogin, getRegister, postLogin, postRegister, getDashboard, getLandingPage } = require('./../controllers/admin.controller');

router.get("/login",getLogin);
router.post("/login", ensureAuthenticated, postLogin);
router.get("/register", getRegister);
router.post("/register", ensureAuthenticated, postRegister);
router.get("/logout",(req, res)=>{
    req.logout();
    res.redirect("/");
});

router.get("/dashboard", ensureAuthenticated, getDashboard);

router.get("/", getLandingPage);

module.exports = router;
