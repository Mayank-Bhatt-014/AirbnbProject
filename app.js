if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { error } = require("console");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js"); // for express routing of listings.
const reviewsRouter = require("./routes/review.js"); // for express routing of reviews.
const userRouter = require("./routes/user.js");
const DBurl = process.env.ATLASDB_URL;




app.set("view engine", "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));


const store = MongoStore.create({
  mongoUrl: DBurl,
  crypto: { // for encryption
    secret: process.env.SECRET
  },
  touchAfter: 24*3600 // seconds in a day , session will store update info after 1 day even if no change is there
})

store.on("error", () => {
  console.log("error in mongo session store" , err);
})


const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}

// app.get("/" , (req , res) => {
//     res.send("hi i am root");
// });



app.use(session(sessionOptions));
app.use(flash());

// for passport which helps in authentication

app.use(passport.initialize());
app.use(passport.session()); // so that passport can know 1 session even if page are changing
passport.use(new LocalStrategy(User.authenticate()));//help in login and sign up
passport.serializeUser(User.serializeUser()); // to store the info of user in the session
passport.deserializeUser(User.deserializeUser());

app.use((req , res , next) => {
    
    res.locals.success = req.flash("success"); // res.locals variable can be accessed directly in ejs file
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/fakedemouser", async(req , res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student" // this is created auto by passport-local-mongoose
//   });

//   let registereduser = await User.register(fakeUser, "helloworld"); // helloworld is the password
//   res.send(registereduser);

// })

async function main() {
    await mongoose.connect(DBurl);
    
}

main()
  .then(() => {
    console.log("connected to DB");
  }).catch(() => {
    console.log(" error in connecting to db");
  });

app.use("/listings" , listingRouter); // whenever route has listings it will go in listings route which is imported.

// Reviews

app.use("/listings/:id/reviews" , reviewsRouter);// similar to listings.

app.use("/", userRouter);

// app.all('/*', (req,res,next) => {
//     next(new ExpressError(404 , "Page not Found"));
// });


app.use((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

app.use((err , req , res, next) => { // custom error handler
    let { statusCode=500  , message="something went wrong"} = err;
    res.render("error.ejs" , {message});
});


app.listen(port , () => {
    console.log(`port is listening to ${port}`);
});



