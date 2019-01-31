const router = require('express').Router()
const encryption = require('../services/encryption')
const transporter = require('../services/email-transporter')
const User = require('mongoose').model('user')
const requireBody = require('../middlewares/requireBody')
const requireParams = require('../middlewares/requireParams')
const requireLogout = require('../middlewares/requireLogout')
const requireLogin = require('../middlewares/requireLogin')
const requireRank = require('../middlewares/requireRank')
const passwdLen = require('../config/auth-cfg')

router.get('/', 
    [requireLogout()],
    (req, res) =>{
    res.send('Meme Hell Authpage')
})

router.post('/register', 
    [requireLogout(), requireBody(['nickname', 'email', 'password'])], 
    async (req, res) =>{

    try{
        let nickname = req.body.nickname
        let email = req.body.email
        let password = req.body.password

        if(password.length < passwdLen){
            throw Error('Password is too short')
        }

        if(await User.findOne({'nickname' : nickname})){
           throw Error('This nickname is occupied')
        }

        if(await User.findOne({'email.name' : email})){
            throw Error('This email is occupied')
        }

        let user =  new User({

            nickname : nickname,

            password : password,
        
            email : email
            
        })

        await user.save()

        res.status(201)
        res.json({message: 'User added'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
})

router.post('/login', 
    [requireLogout(), requireBody(['nickname', 'password'])], 
    async (req, res) =>{

    try{
        let nickname = req.body.nickname
        let password = req.body.password
    
        let user = await User.findOne({'nickname' : nickname})
    
        if(!user){
            throw Error('This user doesn\'t exist')
        }
    
        if(! await user.authenticate(password)){
           throw Error('Invalid password')
        }
    
        req.session.user = {
            _id : user._id,
            nickname : user.nickname,
            email : user.email,
            rank : user.rank
        }
    
        res.status(200)
        res.json({message: 'Signed in'})
        return

    }catch(err){
        res.status(400)
        res.json({message: err.message})
        return
    }
    
})

router.post('/logout', 
    [requireLogin()],
    (req, res) =>{
    
    req.session.user = null

    res.status(200)
    res.json({message: 'Logged out'})
    return
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

module.exports = router