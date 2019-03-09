const router = require('express').Router()
const encryption = require('../services/encryption')
const transporter = require('../services/email-transporter')
const User = require('mongoose').model('user')
const requireBody = require('../middlewares/requireBody')
const requireParams = require('../middlewares/requireParams')
const requireLogin = require('../middlewares/requireLogin')
const requireRank = require('../middlewares/requireRank')
const authCfg = require('../config/auth-cfg')


router.post('/register', 
    [requireBody(['nickname', 'email', 'password'])], 
    async (req, res) =>{

    try{
        const nickname = req.body.nickname
        const email = req.body.email
        const password = req.body.password

        if(!authCfg.nicknamePattern.exec(nickname)){
            throw Error(["Incorrect nickname!"])
        }

        if(!authCfg.emailPattern.exec(email)){
            throw Error(["Incorrect email!"])
        }

        if(!authCfg.passwdPattern.exec(password)){
            throw Error(["Incorrect password!"])
        }

        if(await User.findOne({'nickname' : nickname})){
            throw Error(["This nickname is taken!"])
        }

        if(await User.findOne({'email' : email})){
            throw Error(["This email is taken!"])
        }

        const user =  new User({

            nickname : nickname,

            password : password,
        
            email : email
            
        })
        
        await user.save()

        res.status(201)
        res.json("User added!")

    }catch(err){
        if(Array.isArray(err.message)){
            res.status(400)
            res.json({
                message : err.message[0]
            })
        }else{
            res.status(500)
            res.json({
                message : err.message
            })
        }

        return
    }
})

router.post('/login', 
    [requireBody(['login', 'password'])], 
    async (req, res) =>{

    try{
        let login = req.body.login
        let password = req.body.password
    
        let user = await User.findOne({'nickname' : login})
        if(!user){
            user = await User.findOne({'email' : login})
        }
    
        if(!user){
            throw Error(['This user doesn\'t exist'])
        }
    
        if(! await user.authenticate(password)){
           throw Error(['Invalid password'])
        }
    
        userData = {
            _id : user._id,
            nickname : user.nickname,
            email : user.email,
            rank : user.rank
        }
    
        res.status(200)
        res.json({
            message: 'Signed in',
            data : {
                user : userData
            }
        })

    }catch(err){
        if(Array.isArray(err.message)){
            res.status(400)
            res.json({
                message : err.message[0]
            })
        }else{
            res.status(500)
            res.json({
                message : err.message
            })
        }
    }
    
})

router.post('/confirm-email', 
    [requireLogin(), requireRank(['Guest'])],
    (req, res) =>{

    try{
        if(req.session.user.rank != 'Guest'){
            throw('User\'s email is confirmed')
        }
    
        let encryptedId = encryption.encrypt(String(req.session.user._id))
    
        transporter.sendMail({
            to: req.session.user.email,
            subject: 'Email Confirmation ✅',
            html: '<h1>Confirm Email!</h1><br><a href="http://localhost:3000/auth/email-confirmed?key='+encryptedId+'">Confirm</a>'
        }, function(error, info){
            if (error) {
                throw Error("Cannot send email!")
            }

            res.status(200)
            res.json({message: 'Email sent'})
            return
        })

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})

router.get('/email-confirmed', 
    [requireParams(['key'])],
    async (req, res) =>{

    try{
        let _id = encryption.decrypt(req.query.key)
    
        let user = await User.findOne({'_id' : _id})

        if(!user){
            throw Error('Wrong activation code')
        }

        if(user.rank != 'Guest'){
            throw Error('This email is confirmed')
        }

        user.rank = 'Member'
        await user.save()

        res.status(200)
        res.json({message: 'Email confirmed'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})


router.post('/check-email', 
    [requireBody(['email'])], 
    async (req, res) =>{

    try{
    
        let email = req.body.email
        let user = await User.findOne({'email' : email})
        
        if(user){
            throw Error('This email is taken!')
        }

        res.status(200)
        res.json({message: 'This email is available!'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})


router.post('/check-nickname', 
    [requireBody(['nickname'])], 
    async (req, res) =>{

    try{
    
        let nickname = req.body.nickname
        let user = await User.findOne({'nickname' : nickname})
        
        if(user){
            throw Error('This nickname is taken!')
        }

        res.status(200)
        res.json({message: 'This nickname is available!'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})

module.exports = router