const express = require("express");
const router = express.Router({mergeParams: true}); // merge params true because sending parameters in child routes too(here too)
const User = require("../models/user.js");
const passport = require("passport");
const userController = require("../controllers/user.js")

router.get("/signup" , userController.signupForm);

router.post("/signup", userController.signUp);


router.get("/login" , userController.loginForm);

router.post("/login",
    passport.authenticate("local" , {failureRedirect: "/login" , failureFlash: true}) , // passport.authenticate is the main thing
    async(req,res) => {
        req.flash("success" , "Welcome to Airbnb!");
        res.redirect("/listings");
});


router.get("/logout" , userController.logout);


module.exports = router;