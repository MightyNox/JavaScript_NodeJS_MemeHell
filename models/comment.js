const mongoose = require('mongoose')
const {Schema} = mongoose

const commentSchema = new Schema({

    memeId : {
        type : String,
        required : true,
        unique : false,
        default : null
    },

    author : {
        type : String,
        required : true,
        unique : false,
        default : null
    },

    content : {
        type : String,
        required : true,
        unique : false,
        default : null
    },

    date : {
        type : Date,
        required : true,
        unique : false,
        default : null
    }

})

    
mongoose.model('comment', commentSchema)