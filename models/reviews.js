const mongoose = require('mongoose');

const reviewSchema =new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    review : String,
    mid : Number
});
const Review = mongoose.model('Review',reviewSchema);
module.exports = Review;