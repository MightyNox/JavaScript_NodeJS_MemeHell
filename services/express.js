const bodyParser = require('body-parser')
const port = require('../config/port-cfg')

module.exports = app =>{

    app.use(bodyParser.urlencoded({extended : true}))
    app.use(bodyParser.json())

    //routes
    app.use('/', require('../routes/home'))
    app.use('/admin/user', require('../routes/user'))
    app.use('/admin/tag', require('../routes/tag'))
    app.use('/auth', require('../routes/auth'))
    app.use('/meme', require('../routes/meme'))

    //port
    app.listen(port)
}