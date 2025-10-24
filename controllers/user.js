const User = require("../models/user.js");


module.exports.signupForm = (req , res) =>{
    res.render("users/signup.ejs");
}

module.exports.signUp = async(req ,res) => {
    try {
        let {username , email , password} = req.body;
        const newUser = new User({email , username});
        const registeredUser = await User.register(newUser , password);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success" , "Welcome to AirBnb");
            res.redirect("/listings");
        })

    
    } catch (error) {
        req.flash("error" , error.message)
        res.redirect("/signup");
    
    }
};

module.exports.loginForm =(req , res) => {
    res.render("users/login.ejs");
};

module.exports.logout =  (req , res) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};