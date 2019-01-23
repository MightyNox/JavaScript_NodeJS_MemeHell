const router = require('express').Router()
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
    
        email : {
            name : req.body.email,
            confirmed : "False"
        }
        
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
        nickname : user.nickname
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

module.exports = router