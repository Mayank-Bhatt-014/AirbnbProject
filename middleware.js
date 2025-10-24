module.exports.isLoggedIn = (req , res , next) => {
    if(!req.isAuthenticated()){ // this is a passport method which checks a user is logged in or not
        
        req.flash("error", "you must be logged in to create listing.");
        return res.redirect("/login");
    }
    next();
}