const mongoose = require('mongoose');

const ratingSchema =new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    rating : Number,
    mid : Number
});
const Rating = mongoose.model('Rating',ratingSchema);
module.exports = Rating;