const app = require('express')()
const bodyParser = require('body-parser')

require('./services/database')
require('./models/user')

app.use(bodyParser.urlencoded({extended : true}))
app.use('/', require('./routes/home'))
app.use('/user', require('./routes/user'))
app.use('/auth', require('./routes/auth'))
app.listen('3000')

