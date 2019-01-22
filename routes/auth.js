const router = require('express').Router()
const User = require('mongoose').model('user')
const requireBody = require('../middlewares/requireBody')

router.get('/', (req, res) =>{
    res.send('Meme Hell Authpage')
})

router.post('/register', 
    [requireBody(['nickname', 'email', 'password'])], 
    async (req, res) =>{

    let nickname = req.body.nickname
    let email = req.body.email
    let password = req.body.password

    if(await User.findOne({'nickname' : nickname})){
        res.status(500)
        res.json({message: 'This nickname is occupied'})
        return
    }

    if(await User.findOne({'email.name' : email})){
        res.status(500)
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
    res.json({message: 'User create successfully'})
    return
})

router.post('/login', (req, res) =>{
    res.send('Meme Hell Homepage')
})

router.post('/logout', (req, res) =>{
    res.send('Meme Hell Homepage')
})

module.exports = router