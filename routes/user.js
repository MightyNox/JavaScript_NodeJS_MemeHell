const router = require('express').Router()
const User = require('mongoose').model('user')
const requireLogin = require('../middlewares/requireLogin')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')


router.get('/', 
    [requireLogin(), requireRank(['Admin'])], 
    async (req, res) =>{

    let users = await User.find({})

    res.status(200)
    res.json({message: users})
    return
})


router.put('/setrank', 
    [requireLogin(), requireRank(['Admin']), requireBody(['id', 'rank'])], 
    async (req, res) =>{

    let rank = req.body.rank
    let userId = req.body.id

    if(rank != 'Guest' && rank != 'Member' && rank != 'Admin'){
        res.status(400)
        res.json({message: 'Incorrect rank'})
        return
    }

    let user = await User.findOne({'_id' : userId})
    
    if(!user){
        res.status(400)
        res.json({message: 'Incorrect user id'})
        return
    }

    user.rank = rank

    await user.save()

    res.status(200)
    res.json({message: 'Rank updated'})
    return
})


module.exports = router