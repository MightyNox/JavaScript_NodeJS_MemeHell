const bodyParser = require('body-parser')
const port = require('../config/port-cfg')

module.exports = app =>{
    //routes
    app.use(bodyParser.urlencoded({extended : true}))
    app.use('/', require('../routes/home'))
    app.use('/user', require('../routes/user'))
    app.use('/auth', require('../routes/auth'))

    //port
    app.listen(port)
}