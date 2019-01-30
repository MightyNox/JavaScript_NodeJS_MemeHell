const mongoose = require('mongoose')
const {Schema} = mongoose

const memeSchema = new Schema({

    title : {
        type : String,
        required : true,
        unique : false,
        default : null
    },

    img : {
        data : {
            type : Buffer,
            required : true,
            default : null
        },

        type : {
            type : String,
            required : true,
            unique : false,
            default : null
        }
    },

    tags : [{
        type : String,
        required : true,
        unique : false,
        default : null
    }],

    author : {
        type : String,
        required : true,
        unique : false,
        default : null
    },

    rating : {
        type : Number,
        required : true,
        unique : false,
        default : 0
    },

    date : {
        type : Date,
        required : true,
        unique : false,
        default : null
    }
})


mongoose.model('meme', memeSchema)