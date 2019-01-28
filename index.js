const app = require('express')()

//models
require('./models/user')
require('./models/meme')
require('./models/tag')

//services
require('./services/database')
require('./services/cookies')(app)
require('./services/express')(app)