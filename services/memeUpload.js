const multer = require('multer')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const memeCfg = require('../config/meme-cfg')
const jwtCfg = require('../config/jwt-cfg')
const Tag = require('mongoose').model('tag')
const ClientError = require('../errors/ClientError')
const Meme = require('mongoose').model('meme')

let filename

const upload = multer({ 
    storage:  multer.diskStorage({
        destination: memeCfg.locationPath,
        filename: async function (req, file, callback) {
            callback(null, filename+"."+file.mimetype.split("/").pop())
        }
    }),
    fileFilter : async (req, file, callback) => {
             
        if (memeCfg.extensions.indexOf(file.originalname.split('.').pop()) === -1) {
            return callback(new ClientError('Wrong file extension!'))
        }

        if(!req.body.token){
            throw new ClientError("Body lack of token!")
        }

        const title = req.body.title
        if(!title){
            throw new ClientError("Body lack of title!")
        }
    
        const author = jwt.verify(req.body.token, jwtCfg.secret, (error, decoded)=>{
            if(error){
                throw new ClientError("Authorization failed")
            }

            return decoded
        }).nickname

        const dbTags = (await Tag.find({})).map(function(tag){
            return tag.name
        })
    
        let tags = req.body.tags
        if(tags)
        {
            const tags = tags.split(",")
            if(!tags.every(r=> dbTags.indexOf(r) >= 0)){
                return callback(new ClientError('Incorrect body tags'))
            }
        }else{
            tags = null
        }
        
        const date = new Date()

        let meme = new Meme({

            title : title,

            tags : tags,

            author : author,

            rating : 0,

            date : date
        })

        meme = await meme.save()

        filename = meme._id
        
        callback(null, true)
    }
})

module.exports = upload.fields([
    {name: 'file', maxCount:1}
])