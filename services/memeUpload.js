const multer = require('multer')
const memeCfg = require('../config/meme-cfg')
const Tag = require('mongoose').model('tag')


const upload = multer({ 
    storage:  multer.diskStorage({
        destination: memeCfg.locationPath,
        filename: async function (req, file, callback) {
            callback(null,req.session.user.nickname+'.tmp')
        }
    }),
    fileFilter : async (req, file, callback) => {
        if(!req.body.title){
            return callback(new Error('Body lack of title'))
        }

        if(!Array.isArray(req.body.tags)){
            return callback(new Error('Body lack of tags array'))
        }
    
        let dbTags = (await Tag.find({})).map(function(tag){
            return tag.name
        })
    
        if(!req.body.tags.every(r=> dbTags.indexOf(r) >= 0)){
            return callback(new Error('Incorrect body tags'))
        }
                
        if (memeCfg.extensions.indexOf(file.originalname.split('.').pop()) === -1) {
            return callback(new Error('Wrong file extension'))
        }
        
        callback(null, true)
    }
})

module.exports = upload.fields([
    {name: 'file', maxCount:1}
])