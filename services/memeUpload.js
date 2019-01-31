const multer = require('multer')
const memeCfg = require('../config/meme-cfg')

const storage = multer.diskStorage({
    destination: memeCfg.locationPath,
    filename: async function (req, file, callback) {
        callback(null,req.session.user.nickname+'.tmp')
    }
  })

const upload = multer({storage: storage})

module.exports = upload