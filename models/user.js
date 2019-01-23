const mongoose = require('mongoose')
const {Schema} = mongoose
const bcrypt = require('bcrypt')

const userSchema = new Schema({

    nickname : {
        type : String,
        required : false,
        unique : true,
        default : null
    },

    password : {
        type : String,
        required : false,
        unique : false,
        default : null
    },

    email : {
        name : {
            type : String,
            required : true,
            unique : true
        },

        confirmed : {
            type : String,
            require : true,
            unique : false,
            default : "False"
        }
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

userSchema.pre('save', function(next) {
    if (!this.isModified('password')) 
        return next()
  
    bcrypt.hash(this.password, 9).then((hash) => {
      this.password = hash
      next()
    }).catch(next)
})
  
userSchema.methods = {
    authenticate (password) {
        return bcrypt.compare(password, this.password)
        .then((valid) => valid ? true : false)
        }
}
    
mongoose.model('user', userSchema)