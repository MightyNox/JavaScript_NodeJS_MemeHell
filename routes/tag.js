const router = require('express').Router()
const Tag = require('mongoose').model('tag')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')


router.get('/', async (req, res) =>{

    try{
        let tags = await Tag.find({})

        res.status(200)
        res.json({tags : tags})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
    
})


router.post('/add', 
    [requireBody(['tag'])], 
    async (req, res) =>{

    try{
        let tagName = req.body.tag

        if(await Tag.findOne({'name' : tagName})){
            throw Error('This tag is occupied')
        }

        let tag =  new Tag({

            name : tagName,
            
        })

        await tag.save()

        res.status(201)
        res.json({message: 'Tag added'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
    
})


router.delete('/delete', 
    [requireRank(['Admin']), requireBody(['tag'])], 
    async (req, res) =>{

    try{
        let tagName = req.body.tag

        if(!await Tag.findOneAndDelete({'name' : tagName})){
            throw Error('This tag doesn\'t exist')
        }

        res.status(200)
        res.json({message: 'Tag deleted'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
    
})


module.exports = router