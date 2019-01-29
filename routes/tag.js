const router = require('express').Router()
const Tag = require('mongoose').model('tag')
const requireLogin = require('../middlewares/requireLogin')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')


router.get('/', 
    [requireLogin(), requireRank(['Admin'])], 
    async (req, res) =>{

    let tags = await Tag.find({})

    res.status(200)
    res.json({message: tags})
    return
})


router.post('/add', 
    [requireLogin(), requireRank(['Admin']), requireBody(['tag'])], 
    async (req, res) =>{

    let tagName = req.body.tag

    if(await Tag.findOne({'name' : tagName})){
        res.status(400)
        res.json({message: 'This tag is occupied'})
        return
    }

    let tag =  new Tag({

        name : tagName,
        
    })

    await tag.save()

    res.status(201)
    res.json({message: 'Tag added'})
    return
})


router.delete('/delete', 
    [requireLogin(), requireRank(['Admin']), requireBody(['tag'])], 
    async (req, res) =>{

    let tagName = req.body.tag

    if(!await Tag.findOneAndDelete({'name' : tagName})){
        res.status(400)
        res.json({message: 'This tag doesn\'t exist'})
        return
    }

    res.status(200)
    res.json({message: 'Tag deleted'})
    return
})


module.exports = router