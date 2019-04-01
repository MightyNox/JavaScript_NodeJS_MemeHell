function requireParams(arr) {
    return function(req, res, next) {
        for(let i =0; i < arr.length; i++) {
            if(!req.query.hasOwnProperty(arr[i])){
                res.status(400)
                res.json({message: 'Params lack of '+arr[i]})
                return 
            }
        }
        next()
    }
}

module.exports = requireParams