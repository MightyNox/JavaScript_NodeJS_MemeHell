const app = require('express')()
const {name, age, key} = require('../config/cookies-cfg')
const cookieSession = require('cookie-session')

module.exports = app =>{
    app.use(
        cookieSession({
            name : name,
            maxAge: age,
            keys: key
        })
    )

    app.use(cookieSession({ secret: 'anything' }))
}