const jwt = require('jsonwebtoken')
const User = require('../modals/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace("Bearer ", "")
        const decoded = jwt.verify(token, '12345')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})

        if(!user){
            throw new Error('No user Find')
        }
        
        req.token = token
        req.user = user
        next()

    } catch (error) {
        res.status(400).send({ error: error.message })
    }
}

module.exports = auth;