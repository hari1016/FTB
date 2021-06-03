const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');

const userSchema =new mongoose.Schema({
    email : String,
    address : String,
    city : String,
    state : String,
    zip : Number
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User',userSchema);
module.exports = User;