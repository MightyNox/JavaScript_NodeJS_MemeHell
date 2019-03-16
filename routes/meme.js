const router = require('express').Router()
const Tag = require('mongoose').model('tag')
const Meme = require('mongoose').model('meme')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const jwtCfg = require('../config/jwt-cfg')
const memeCfg = require('../config/meme-cfg')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')
const requireParams = require('../middlewares/requireParams')
const upload = require('../services/memeUpload')
const ClientError = require('../errors/ClientError')


router.get('/', 
    [requireParams(['page', 'limit'])], 
    async (req, res) =>{

    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    try{

        if(isNaN(page) || page < 0){
            throw new ClientError('Incorrect params page number')
        }

        const memes = await Meme.find({})
            .sort({date : 'descending'})
            .skip(page*limit)
            .limit(limit)

        if(memes.length === 0){
            throw new ClientError('There are no specified memes!')
        }

        res.status(200)
        res.json({
            message: "Memes successfully returned!",
            memes : memes
        })

    }catch(error){
        if (error instanceof ClientError) {
            res.status(400)
            res.json({
                message : error.message
            })
        }else{
            res.status(500)
            res.json({
                message : error.message
            })
        }
    }
    
})


router.get('/single', 
    [requireParams(['id'])], 
    async (req, res) =>{

    const id = req.query.id

    try{

        const meme = await Meme.findOne({_id : id})

        if(!meme){
            throw new ClientError('There is no specified meme!')
        }

        res.status(200)
        res.json({
            message: "Meme successfully returned!",
            meme : meme
        })

    }catch(error){
        if (error instanceof ClientError) {
            res.status(400)
            res.json({
                message : error.message
            })
        }else{
            res.status(500)
            res.json({
                message : error.message
            })
        }
    }
    
})


router.post('/rate', 
    [requireBody(['id', 'token'])], 
    async (req, res) =>{

    const id = req.body.id

    try{

        const username = jwt.verify(req.body.token, jwtCfg.secret, (error, decoded)=>{
            if(error){
                throw new ClientError("Authorization failed")
            }

            return decoded
        }).nickname

        const dbMeme = await Meme.findOne({_id : id})

        if(!dbMeme){
            throw new Error('There is no specified meme!')
        }

        if(dbMeme.rating.voted.indexOf(username) > -1){
            throw new ClientError('This user have rated this meme!')
        }

        dbMeme.rating.value++
        dbMeme.rating.voted.push(username)

        await dbMeme.save()

        res.status(200)
        res.json({
            message: "Meme successfully returned!",
            meme : dbMeme
        })

    }catch(error){
        if (error instanceof ClientError) {
            res.status(400)
            res.json({
                message : error.message
            })
        }else{
            res.status(500)
            res.json({
                message : error.message
            })
        }
    }
    
})


router.get('/count', async (req, res) =>{
    try{

        const count = await Meme.countDocuments({})

        res.status(200)
        res.json({
            message: "Meme count returned!",
            count : count
        })

    }catch(error){
        res.status(500)
        res.json({
            message : error.message
        })
    }
    
})


router.get('/tag', 
    [requireRank(['Member', 'Admin'])], 
    async (req, res) =>{

    try{
        let page = parseInt(req.body.page)
        if(isNaN(page) || page < 0){
            throw Error('Incorrect page number')
        }

        let tags = req.body.tags
        {
            if(!Array.isArray(tags)){
              
                throw Error('Incorrect body tags')
            }
  
            let dbTags = (await Tag.find({})).map((tag) => {
                return tag.name
            })
  
            if(!tags.every(r=> dbTags.indexOf(r) >= 0)){
                throw Error('Incorrect body tags')
            }
        }

        let memes = await Meme
            .find({})
            .where('tags')
            .all(tags)
            .sort({date : 'descending'})
            .skip(page*memeCfg.pageLimit)
            .limit(memeCfg.pageLimit)


        if(memes.length === 0){
            throw Error('This page is empty')
        }

        res.status(200)
        res.json({message: memes})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
    
})


router.post('/add', async (req, res) =>{
        upload(req, res, async function (err) {
        try{
            if (err instanceof multer.MulterError) {
                throw err
            } else if (err) {
                throw err
            }

            if(!req.files.file){
                throw new ClientError("None file uploaded!")
            }

            res.status(201)
            res.json({message: 'Meme added'})

        }catch(error){
            
            if (error instanceof ClientError) {
                res.status(400)
                res.json({
                    message : error.message
                })
            }else{
                res.status(500)
                res.json({
                    message : error.message
                })
            }
        }
    })
})


module.exports = router