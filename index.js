const app = require('express')()

//models
require('./models/user')

//services
require('./services/database')
require('./services/cookies')(app)
require('./services/express')(app)