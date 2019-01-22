function requireBody(arr) {
    return function(req, res, next) {
        for(let i =0; i < arr.length; i++) {
            if(!req.body.hasOwnProperty(arr[i])){
                res.status(400)
                res.json({message: 'req.body lack of '+arr[i]})
                return 
            }
        }
        next()
    }
}

module.exports = requireBody