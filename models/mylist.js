const mongoose = require('mongoose');

const listSchema =new mongoose.Schema({
    title : String,
    imlink : String,
    rating : String,
    desc : String,
    type : String,
    mid : Number
});
const List = mongoose.model('List',listSchema);
module.exports = List;