const router = require('express').Router()
const Tag = require('mongoose').model('tag')
const Meme = require('mongoose').model('meme')
const fs = require('fs')
const multer = require('multer')
const memeCfg = require('../config/meme-cfg')
const requireRank = require('../middlewares/requireRank')
const upload = require('../services/memeUpload')
const ClientError = require('../errors/ClientError')

router.get('/', 
    [requireRank(['Member', 'Admin'])], 
    async (req, res) =>{

    try{
        let page = parseInt(req.body.page)
        if(isNaN(page) || page < 0){
            throw Error('Incorrect body page number')
        }

        let memes = await Meme.find({})
            .sort({date : 'descending'})
            .skip(page*memeCfg.pageLimit)
            .limit(memeCfg.pageLimit)

        if(memes.length === 0){
            throw Error('Incorrect page number')
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