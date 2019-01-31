const router = require('express').Router()
const Tag = require('mongoose').model('tag')
const Meme = require('mongoose').model('meme')
const fs = require('fs')
const memeCfg = require('../config/meme-cfg')
const requireLogin = require('../middlewares/requireLogin')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')
const upload = require('../services/memeUpload')

router.get('/', 
    [requireLogin(), requireRank(['Member', 'Admin']), requireBody(['page'])], 
    async (req, res) =>{

    try{
        let page = parseInt(req.body.page)
        if(isNaN(page) || page < 0){
            throw Error('Incorrect page number')
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


router.post('/add', 
    [requireLogin(), requireRank(['Member', 'Admin']), upload.single('file')], 
    async (req, res) =>{
    try{
    
        let title = req.body.title
        if(!title){
            throw Error('Incorrect body title')
        }

        let file = req.file
        if(!file){
            throw Error('Incorrect body file')
        }
  
        let tags = req.body.tags
        {
            if(!Array.isArray(tags)){
              
                throw Error('Incorrect body tags')
            }
  
            let dbTags = (await Tag.find({})).map(function(tag){
                return tag.name
            })
  
            if(!tags.every(r=> dbTags.indexOf(r) >= 0)){
                throw Error('Incorrect body tags')
            }
        }


        let author = req.session.user.nickname
        let date = new Date()

        let meme = new Meme({

            title : title,

            tags : [tags],

            author : author,

            rating : 0,

            date : date
        })

        
        meme = await meme.save()
        fs.rename(memeCfg.locationPath+author+'.tmp', memeCfg.locationPath+meme._id+'.'+(req.file.originalname).split('.').pop(), 
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


module.exports = router