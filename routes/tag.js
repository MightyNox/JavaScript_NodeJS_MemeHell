const router = require('express').Router()
const Tag = require('mongoose').model('tag')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')


router.get('/', async (req, res) =>{

    try{
        const tags = await Tag.find({})

        tags.sort(function(a, b){
            return a.name.localeCompare(b.name)
        })

        res.status(200)
        res.json({tags : tags})
        return

    }catch(error){
        res.status(400)
        res.json({message: error.message})
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

    }catch(error){
        res.status(400)
        res.json({message: error.message})
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

    }catch(error){
        res.status(400)
        res.json({message: error.message})
        return
    }
    
})


module.exports = router