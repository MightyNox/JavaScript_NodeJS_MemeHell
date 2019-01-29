const mongoose = require('mongoose')
const {Schema} = mongoose
const bcrypt = require('bcrypt')

const userSchema = new Schema({

    nickname : {
        type : String,
        required : true,
        unique : true,
        default : null
    },

    password : {
        type : String,
        required : true,
        unique : false,
        default : null
    },

    email : {
        type : String,
        required : true,
        unique : true,
        default : null
    },

    gender : {
        type : String,
        required : false,
        unique : false,
        default : null
    },

    rank : {
        type : String,
        required : true,
        unique : false,
        default : "Guest"
    }

})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) 
        return next()
  
    this.password = await bcrypt.hash(this.password, 9)
})
  
userSchema.methods = {
    authenticate (password) {
        return bcrypt.compare(password, this.password)
        }
}
    
mongoose.model('user', userSchema)