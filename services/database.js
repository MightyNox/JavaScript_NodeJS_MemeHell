const mongoose = require('mongoose')
const URI = require('../config/database-cfg')

mongoose.connect(URI, { useNewUrlParser: true })
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

const databaseConnection = mongoose.connection
databaseConnection.on('error', function(){
  throw new Error("Cannot connect to the database!")
})
databaseConnection.once('open', function() {
  console.log("Connected to the database!")
})