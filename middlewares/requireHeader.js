function requireBody(arr) {
    return function(req, res, next) {
        for(let i =0; i < arr.length; i++) {
            if(!req.get(arr[i])){
                res.status(400)
                res.json({message: 'Header lack of '+arr[i]})
                return 
            }
        }
        next()
    }
}

module.exports = requireBody