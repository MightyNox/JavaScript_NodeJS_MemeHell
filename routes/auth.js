const router = require('express').Router()
const bcrypt = require('bcrypt')
const transporter = require('../services/email-transporter')
const User = require('mongoose').model('user')
const requireBody = require('../middlewares/requireBody')
const requireLogout = require('../middlewares/requireLogout')
const requireLogin = require('../middlewares/requireLogin')

router.get('/', 
    [requireLogout()],
    (req, res) =>{
    res.send('Meme Hell Authpage')
})

router.post('/register', 
    [requireLogout(), requireBody(['nickname', 'email', 'password'])], 
    async (req, res) =>{

    let nickname = req.body.nickname
    let email = req.body.email
    let password = req.body.password

    if(password.length < 8){
        res.status(400)
        res.json({message: 'Password is too short'})
        return
    }

    if(await User.findOne({'nickname' : nickname})){
        res.status(400)
        res.json({message: 'This nickname is occupied'})
        return
    }

    if(await User.findOne({'email.name' : email})){
        res.status(400)
        res.json({message: 'This email is occupied'})
        return
    }

    let user =  new User({

        nickname : nickname,

        password : password,
    
        email : email
        
    })

    await user.save()

    res.status(201)
    res.json({message: 'Signed up'})
    return
})

router.post('/login', 
    [requireLogout(), requireBody(['nickname', 'password'])], 
    async (req, res) =>{

    let nickname = req.body.nickname
    let password = req.body.password

    let user = await User.findOne({'nickname' : nickname})

    if(!user){
        res.status(400)
        res.json({message: 'This user doesn\'t exist'})
        return
    }

    if(! await user.authenticate(password)){
        res.status(400)
        res.json({message: 'Invalid password'})
        return
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
    [requireLogin()],
    async (req, res) =>{
    
    if(req.session.user.rank != 'Guest'){
        res.status(400)
        res.json({message: 'User\'s email is confirmed'})
        return
    }

    let hashedId = await bcrypt.hash(req.session.user._id, 9)

    await transporter.sendMail({
        to: req.session.user.email,
        subject: 'Email Confirmation ✅',
        html: '<h1>Confirm Email!</h1><br><a href="/?key='+hashedId+'">Confirm</a> '
    }, function(error, info){
        if (error) {
            res.status(400)
            res.json("Cannot send email!")
            return
        }
        else{
            res.status(200)
            res.json({message: 'Email sent'})
            return
        }
    })
})

module.exports = router