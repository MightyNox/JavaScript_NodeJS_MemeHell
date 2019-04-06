const app = require('express')()

//services
require('./services/database')
require('./services/express')(app)