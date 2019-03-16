const mongoose = require('mongoose')
const {Schema} = mongoose

const memeSchema = new Schema({

    type : {
        type : String,
        required : true,
        unique : false,
        default : null
    },

    title : {
        type : String,
        required : true,
        unique : false,
        default : null
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
        value : {
            type : Number,
            required : true,
            unique : false,
            default : 0
        },

        voted : [{
            type : String,
            required : true,
            unique : false,
            default : null
        }]
    },

    date : {
        type : Date,
        required : true,
        unique : false,
        default : null
    }
})


mongoose.model('meme', memeSchema)