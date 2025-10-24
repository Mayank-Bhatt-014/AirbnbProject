const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.createReview = async(req , res) => { // validateReview is acting as a middleware for server side handling
    let listing =  await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success" , " Your review is created successfully!");
    res.redirect(`/listings/${listing._id}`);
};


module.exports.deleteReview = async (req,res) => {
    let {id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){ // to show whole author , we have to populate author in the abovwe line.
        req.flash("error" , "You are not the author of the review");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id , {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success" , " Review Deleted.");
    res.redirect(`/listings/${id}`);
};