const router = require('express').Router()
const encryption = require('../services/encryption')
const transporter = require('../services/email-transporter')
const jwt = require('jsonwebtoken')
const User = require('mongoose').model('user')

const requireBody = require('../middlewares/requireBody')
const requireParams = require('../middlewares/requireParams')
const authCfg = require('../config/auth-cfg')
const jwtCfg = require('../config/jwt-cfg')
const ClientError = require('../errors/ClientError')


router.post('/register', 
    [requireBody(['nickname', 'email', 'password'])], 
    async (req, res) =>{

    try{
        const nickname = req.body.nickname
        const email = req.body.email
        const password = req.body.password

        if(!authCfg.nicknamePattern.exec(nickname)){
            throw new ClientError("Incorrect nickname!")
        }

        if(!authCfg.emailPattern.exec(email)){
            throw new ClientError("Incorrect email!")
        }

        if(!authCfg.passwdPattern.exec(password)){
            throw new ClientError("Incorrect password!")
        }

        if(await User.findOne({'nickname' : nickname})){
            throw new ClientError("This nickname is taken!")
        }

        if(await User.findOne({'email' : email})){
            throw new ClientError("This email is taken!")
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
            throw new ClientError('This user doesn\'t exist')
        }
    
        if(! await user.authenticate(password)){
           throw new ClientError('Invalid password')
        }

        if(user.rank === "Guest"){
            throw new ClientError(
                'This user\'s email isn\'t confirmed!', {
                emailConfirmed : false
            })
        }
    
        const token = jwt.sign(
            { 
                id : user._id,
                nickname : user.nickname,
                email : user.email,
                rank : user.rank
            }, 
            jwtCfg.secret, 
            {
            expiresIn : jwtCfg.validity
        })
    
        res.status(200)
        res.json({
            message: 'Signed in',
            token: token 
        })

    }
    catch(error){
        if (error instanceof ClientError) {
            res.status(400)
            res.json({
                message : error.message,
                data : error.data
            })
        }else{
            res.status(500)
            res.json({
                message : error.message
            })
        }
    }
})

router.post('/confirm-email', 
    [requireBody(['login'])],
    async (req, res) =>{

    try{
        const login = req.body.login

        let user = await User.findOne({'nickname' : login})
        if(!user){
            user = await User.findOne({'email' : login})
        }

        if(user.rank != 'Guest'){
            throw new ClientError('User\'s email is confirmed')
        }
    
        let encryptedId = encryption.encrypt(String(user._id))
    
        try{
            await transporter.sendMail({
                to: user.email,
                subject: 'Email Confirmation ✅',
                html: '<h1>Confirm Email!</h1><br><a href="http://localhost:3000/email-confirmed/'+encryptedId+'">Confirm</a>'
            })

        }catch(error){
            throw new ClientError("Cannot send email!")
        }

        res.status(200)
        res.json({message: 'Email sent'})
        return

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

router.get('/email-confirmed', 
    [requireParams(['key'])],
    async (req, res) =>{

    try{
        const _id = encryption.decrypt(req.query.key)
        const user = await User.findOne({'_id' : _id})

        if(!user){
            throw new ClientError('Wrong activation code')
        }

        if(user.rank != 'Guest'){
            throw new ClientError('This email is confirmed')
        }

        user.rank = 'Member'
        await user.save()

        res.status(200)
        res.json({message: 'Email confirmed'})

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


router.post('/check-email', 
    [requireBody(['email'])], 
    async (req, res) =>{

    try{
    
        let email = req.body.email
        let user = await User.findOne({'email' : email})
        
        if(user){
            throw new ClientError('This email is taken!')
        }

        res.status(200)
        res.json({message: 'This email is available!'})
        return

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


router.post('/check-nickname', 
    [requireBody(['nickname'])], 
    async (req, res) =>{

    try{
    
        let nickname = req.body.nickname
        let user = await User.findOne({'nickname' : nickname})
        
        if(user){
            throw new ClientError('This nickname is taken!')
        }

        res.status(200)
        res.json({message: 'This nickname is available!'})
        return

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

module.exports = router