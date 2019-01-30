const router = require('express').Router()
const fs = require('fs')
const Meme = require('mongoose').model('meme')
const Tag = require('mongoose').model('tag')
const requireLogin = require('../middlewares/requireLogin')
const requireRank = require('../middlewares/requireRank')
const requireBody = require('../middlewares/requireBody')

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.get('/', 
    [requireLogin(), requireRank(['Member', 'Admin']), requireBody(['id'])], 
    async (req, res) =>{

    let meme = await Meme.findOne({id:req.body._id})

    
    res.status(200)
    res.send(meme)
    return
})


router.post('/add', 
    [requireLogin(), requireRank(['Member', 'Admin']),  multipartMiddleware], 
    async (req, res) =>{
    
    let title = req.body.title
    let file = req.files.file
    let tags = req.body.tags
    let author = req.session.user.nickname
    let date = new Date()

    //Check body
    {
        if(!title){
            res.status(400)
            res.json({message: 'Incorrect body title'})
            return
        }

        if(!file){
            res.status(400)
            res.json({message: 'Incorrect body file'})
            return
        }

        if(!Array.isArray(tags))
        {
            res.status(400)
            res.json({message: 'Incorrect body tags'})
            return
        }

        let dbTags = (await Tag.find({})).map(function(tag){
            return tag.name
        })

        if(!tags.every(r=> dbTags.indexOf(r) >= 0)){
            res.status(400)
            res.json({message: 'Incorrect body tags'})
            return
        }
    }

    let meme = new Meme({
        title : title,

        img : {
            data : fs.readFileSync(file.path),
            type : file.type
        },

        tags : [tags],

        author : author,

        rating : 0,

        date : date
    })

    await meme.save()

    fs.unlink(req.files.file.path, (err) => {
        if (err) throw err;
    })

    res.status(201)
    res.json({message: 'Meme added'})
    return
})


module.exports = router