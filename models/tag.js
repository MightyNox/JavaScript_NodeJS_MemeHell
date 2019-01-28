const mongoose = require('mongoose')
const {Schema} = mongoose

const tagSchema = new Schema({

    name : {
        type : String,
        required : true,
        unique : true,
        default : null
    }

})

    
mongoose.model('tag', tagSchema)