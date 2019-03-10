const router = require('express').Router()
const Tag = require('mongoose').model('tag')
const Meme = require('mongoose').model('meme')
const fs = require('fs')
const multer = require('multer')
const memeCfg = require('../config/meme-cfg')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')
const upload = require('../services/memeUpload')

router.get('/', 
    [requireRank(['Member', 'Admin']), requireBody(['page'])], 
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
    [requireRank(['Member', 'Admin']), requireBody(['tags', 'page'])], 
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


router.post('/add', 
    [requireRank(['Member', 'Admin'])], 
    async (req, res) =>{
        upload(req, res, async function (err) {
        try{
            if (err instanceof multer.MulterError) {
                throw err
            } else if (err) {
                throw err
            }
            
            let title = req.body.title
            let tags = req.body.tags
            let file = req.files.file[0]
            let author = req.session.user.nickname
            let date = new Date()

            let meme = new Meme({

                title : title,

                tags : tags,

                author : author,

                rating : 0,

                date : date
            })

            meme = await meme.save()
            
            fs.rename(memeCfg.locationPath+author+'.tmp', memeCfg.locationPath+meme._id+'.'+(file.originalname).split('.').pop(), 
            (err) => {
                if ( err ){
                    throw err
                }
            })

            res.status(201)
            res.json({message: 'Meme added'})
            return

        }catch(err){
            if(req.file)
            {
                let author = req.session.user.nickname
                fs.unlinkSync(memeCfg.locationPath+author+'.tmp')
            }

            res.status(400)
            res.json({message: err.message})
            return
        }
    })
})


module.exports = router