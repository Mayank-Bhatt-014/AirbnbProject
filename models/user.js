
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose"); // automatically define username and pass with hashing and salting.

const userSchema = new Schema({
    email:{
        type: String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose); // will create username and pass automatically in userschema , username is unique also everytime

module.exports = mongoose.model("User", userSchema);