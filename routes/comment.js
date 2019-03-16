const router = require('express').Router()
const Comment = require('mongoose').model('comment')
const jwt = require('jsonwebtoken')

const jwtCfg = require('../config/jwt-cfg')
const authCfg = require('../config/auth-cfg')
const requireBody = require('../middlewares/requireBody')
const requireParams = require('../middlewares/requireParams')
const ClientError = require('../errors/ClientError')


router.post('/add', 
    [requireBody(['memeId', 'token', 'content'])],
    async (req, res) =>{
    
    try{

        const memeId = req.body.memeId
        const content = req.body.content
        const username = jwt.verify(req.body.token, jwtCfg.secret, (error, decoded)=>{
            if(error){
                throw new ClientError("Authorization failed")
            }

            return decoded
        }).nickname


        if(!authCfg.comment.exec(content)){
            throw new ClientError("Incorrect content!")
        }

        const comments = await Comment
            .find({memeId : memeId})
            .sort({date : 'ascending'})

        const comment =  new Comment({

            memeId : memeId,
            author : username,
            content : content,
            date : new Date()
            
        })

        await comment.save()

        comments.push(comment)

        res.status(201)
        res.json({
            message: 'Comment added',
            comments : comments
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


router.get('/', 
    [requireParams(['memeId'])], 
    async (req, res) =>{
    try{
        const memeId = req.query.memeId

        const comments = await Comment
            .find({memeId : memeId})
            .sort({date : 'ascending'})

        res.status(200)
        res.json({
            message: 'Meme successfully returned',
            comments : comments
        })

    }catch(error){

        res.status(500)
        res.json({
            message : error.message
        })
    }
})


module.exports = router