const router = require('express').Router()
const User = require('mongoose').model('user')
const requireLogin = require('../middlewares/requireLogin')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')


router.get('/admin/', 
    [requireLogin(), requireRank(['Admin'])], 
    async (req, res) =>{

    try{
        let users = await User.find({})

        users = users.map(function(user) { 
            let userData = {
                nickname : user.nickname,
                email : user.email,
                gender : user.gender,
                rank : user.rank
            }
        
            return userData 
        });

        res.status(200)
        res.json({message: users})
        return
    
    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})


router.put('/admin/set-rank', 
    [requireLogin(), requireRank(['Admin']), requireBody(['id', 'rank'])], 
    async (req, res) =>{

    try{
        let rank = req.body.rank
        let userId = req.body.id

        if(rank != 'Guest' && rank != 'Member' && rank != 'Admin'){
            throw Error('Incorrect rank')
        }

        let user = await User.findOne({'_id' : userId})
        
        if(!user){
            throw Error('Incorrect user id')
        }

        user.rank = rank

        await user.save()

        res.status(200)
        res.json({message: 'Rank updated'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})


router.put('/admin/ban', 
    [requireLogin(), requireRank(['Admin']), requireBody(['nickname'])], 
    async (req, res) =>{

    try{
        let nickname = req.body.nickname

        let user = await User.findOne({'nickname' : nickname})
        
        if(!user){
            throw Error('Incorrect user nickname')
        }

        if(user.rank === 'Outlaw'){
            throw Error('This user is already banned')
        }

        user.rank = 'Outlaw'

        await user.save()

        res.status(200)
        res.json({message: 'User banned'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})


router.get('/update-cookies', 
    [requireLogin()], 
    async (req, res) =>{

    try{
    
        let id = req.body._id
        let user = await User.findOne({'id' : id})
        
        if(!user){
            throw Error('Incorrect user id')
        }

        req.session.user = {
            rank : user.rank 
        }

        res.status(200)
        res.json({message: 'Cookies updated'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})


module.exports = router