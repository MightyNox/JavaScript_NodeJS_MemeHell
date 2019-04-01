const router = require('express').Router()
const Tag = require('mongoose').model('tag')
const Meme = require('mongoose').model('meme')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const jwtCfg = require('../config/jwt-cfg')
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

        if(page === 0 && memes.length === 0){
            throw new ClientError('There are no memes! 👿')
        }

        if(memes.length === 0){
            throw new ClientError('There are no more memes! 👿')
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

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new ClientError('Meme not found! 👿')
        }

        const meme = await Meme.findById(id)

        if(!meme){
            throw new ClientError('Meme not found! 👿')
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
    [requireParams(['tags', 'page', 'limit'])], 
    async (req, res) =>{

    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const tags = req.query.tags

    try{
        if(isNaN(page) || page < 0){
            throw new ClientError('Incorrect page number')
        }

        {
            if(!Array.isArray(tags)){
              
                throw new ClientError('Incorrect tags!')
            }
  
            let dbTags = (await Tag.find({})).map((tag) => {
                return tag.name
            })
  
            if(!tags.every(r=> dbTags.indexOf(r) >= 0)){
                throw new ClientError('Incorrect tags!')
            }
        }

        const memes = await Meme
            .find({})
            .where('tags')
            .all(tags)
            .sort({date : 'descending'})
            .skip(page*limit)
            .limit(limit)

        if(page === 0 && memes.length === 0){
            throw new ClientError('There are no memes with this tags! 👿')
        }

        if(memes.length === 0){
            throw new ClientError('There are no more memes with this tags! 👿')
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