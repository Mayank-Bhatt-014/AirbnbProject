const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { error } = require("console");
const { isLoggedIn } = require("../middleware.js");

const listingController = require("../controllers/listing.js");
const multer = require("multer"); // used for file  for multipart form data
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage }) // destination where the file will go 


const validateListing = (req , res , next) => {
    let result = listingSchema.validate(req.body);
    if(result.error){
        console.log(result)
        throw new ExpressError(400, result.error);
    }else{
        next();
    }
};




//index route
router.get("/" ,wrapAsync(listingController.index));

// new route
router.get("/new" , isLoggedIn, listingController.renderNewForm );

// show route
router.get("/:id" , wrapAsync(listingController.showListing));

//Create route
router.post("/" , isLoggedIn, upload.single("listing[image][url]"), validateListing,  wrapAsync(listingController.createListing )); // validate listing is acting as a middleware
//upload.single("listing[image][url]") this is a multer function which parses the multipart form data to our req.file
//Edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.editListing));

// update route
router.put("/:id" , isLoggedIn, upload.single("listing[image][url]"), validateListing, wrapAsync(listingController.editingListing));

// delete route
router.delete("/:id" , isLoggedIn, wrapAsync(listingController.deleteListing));


module.exports = router;
