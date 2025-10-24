const Listing = require("../models/listing.js");
// geocoding - changing location name to coordinates (forward geocoding)  and vice versa
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

function toTitleCase(str) {// for searching
        return str
            .split(" ") // split into words (arrays of string);
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // capitalize each word
            .join(" "); // join back with spaces
}


module.exports.index = async(req , res) => {
    let allListings = await Listing.find({});
    let{search} = req.query;
    if(search){
    
        allListings = await Listing.find({country: `${toTitleCase(search)}`});
    }
    res.render("listings/index.ejs" , { allListings });
};

module.exports.renderNewForm = (req , res) => {
    
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req , res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews" , populate: {path: "author"}}).populate("owner"); // using nested populate on review every review will have its author also 
    if(!listing){
        req.flash("error" , "The path does not Exist!");
        res.redirect("/listings");
    }else{
        res.render("listings/show.ejs" , { listing });
    }

};

module.exports.createListing = async(req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();


    let url = req.file.path;
    let filename = req.file.filename;
    
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url , filename};
    newlisting.country = toTitleCase(newlisting.country);
    newlisting.geometry = response.body.features[0].geometry;// will return  the coordinate of that location which is in query
    await newlisting.save();

    req.flash("success" , " New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing = async(req , res) => {
    let {id } = req.params
    const currlisting = await Listing.findById(id);
    if(!currlisting.owner.equals(req.user._id)){
        req.flash("error" , " you dont have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    if(!currlisting){
        req.flash("error" , "The path does not Exist!");
        res.redirect("/listings");
    }else{
        res.render("listings/edit.ejs" , { currlisting });
    }
    
}

module.exports.editingListing = async(req , res) => { // validateListing is acting as a middleware
    if(!req.body.listing){
        throw new ExpressError(400 , "please send valid data");
    }
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        req.flash("error" , " you dont have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();

    listing.country = toTitleCase(listing.country);
    listing.geometry = response.body.features[0].geometry;
    await listing.save();

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {url , filename};
        await listing.save();
    }
    req.flash("success" , " Listing has been updated!");
    res.redirect("/listings");

};

module.exports.deleteListing = async(req , res) =>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        
        req.flash("error" , " you dont have permission to Delete");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndDelete(id);
    
    req.flash("success" , " Listing has been deleted!");
    res.redirect("/listings");
    
};