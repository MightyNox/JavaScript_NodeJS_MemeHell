const app = require('express')()

//services
require('./services/database')
require('./services/cookies')(app)
require('./services/express')(app)