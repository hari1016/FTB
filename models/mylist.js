const mongoose = require('mongoose');

const listSchema =new mongoose.Schema({
    title : String,
    imlink : String,
    rating : String,
    desc : String,
    type : String,
    mid : Number,
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
})
const List = mongoose.model('List',listSchema);
module.exports = List;