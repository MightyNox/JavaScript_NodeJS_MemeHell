function requireBody(arr) {
    return function(req, res, next) {
        let hasPermission = false

        for(let i =0; i < arr.length; i++) {
            if(req.session.user.rank === arr[i]){
                hasPermission = true
            }
        }

        if(!hasPermission){
            res.status(400)
            res.json({message: 'You don\'t have permission'})
            return 
        }

        next()
    }
}

module.exports = requireBody