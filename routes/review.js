const express = require("express");
const router = express.Router({mergeParams: true}); // merge params true because sending parameters in child routes too(here too)
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema } = require("../schema.js"); // for validation
const reviewController = require("../controllers/review.js");



const validateReview = (req , res , next) => {
    let result = reviewSchema.validate(req.body ,{convert: true} ); // this convert will safely convert string no. to no.
    if(result.error){
        console.log(result)
        throw new ExpressError(400, result.error);
    }else{
        next();
    }
};


//Post route for reviews

router.post("/" , validateReview, wrapAsync(reviewController.createReview));

//delete route for reviews

router.delete("/:reviewId", wrapAsync(reviewController.deleteReview));

module.exports = router;
