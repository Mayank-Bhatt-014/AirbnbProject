const mongoose = require("mongoose");
const review = require("./review");
const Review = require("./review.js");

const Schema = mongoose.Schema; // for short
let link = "https://cdn.pixabay.com/photo/2023/11/21/19/47/fall-8404115_1280.jpg"

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename:{
            type:String,
            default: "listingimage"
        },
        url:{
            type:String,
            set: (v) => v ===""? "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60" : v
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
    },
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'geometry.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }

});

listingSchema.post("findOneAndDelete" , async(listing) => { // for handling the deletion of reviews if listing is deleted
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing" , listingSchema);

module.exports = Listing;
