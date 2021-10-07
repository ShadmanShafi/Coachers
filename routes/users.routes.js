const express = require("express");
const router = express.Router();
const { getLogin, getRegister, postLogin, postRegister, getDashboard } = require('./../controllers/users.controller');
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


module.exports = router;