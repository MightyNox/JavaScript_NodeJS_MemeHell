const multer = require('multer')
const path = require('../config/meme-path-cfg')

const storage = multer.diskStorage({
    destination: path,
    filename: async function (req, file, callback) {
        callback(null,req.session.user.nickname+'.tmp')
    }
  })

const upload = multer({storage: storage})

module.exports = upload