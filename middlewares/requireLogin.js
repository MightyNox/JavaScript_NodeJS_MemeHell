function requireLogin() {
    return function(req, res, next) {

        if(!req.session.user){
            res.status(400)
            res.json({message: 'Required authorization'})
            return 
        }

        next()
    }
}

module.exports = requireLogin