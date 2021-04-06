const mongoose = require('mongoose');

const reviewSchema =new mongoose.Schema({
    review : String,
    mid : Number
});
const Review = mongoose.model('Review',reviewSchema);
module.exports = Review;