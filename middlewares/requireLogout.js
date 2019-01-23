function requireLogout() {
    return function(req, res, next) {

        if(req.session.user){
            res.status(400)
            res.json({message: 'Forbidden authorization'})
            return 
        }

        next()
    }
}

module.exports = requireLogout