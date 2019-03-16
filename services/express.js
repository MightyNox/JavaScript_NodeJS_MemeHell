const express = require('express')
const bodyParser = require('body-parser')
const port = require('../config/port-cfg')

module.exports = app =>{

    app.use(bodyParser.urlencoded({extended : true}))
    app.use(bodyParser.json())

    //static files
    app.use(express.static('public'))

    //routes
    app.use('/user', require('../routes/user'))
    app.use('/tag', require('../routes/tag'))
    app.use('/auth', require('../routes/auth'))
    app.use('/meme', require('../routes/meme'))

    //port
    app.listen(port)
}