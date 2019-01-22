const router = require('express').Router()

router.get('/', (req, res) =>{
    res.send('Meme Hell Homepage')
})

module.exports = router