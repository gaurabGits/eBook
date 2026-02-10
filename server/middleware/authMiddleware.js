const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    // token format: Bearer <token>
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decode; // attach user info, later routes can use it.
            next(); // allow request 

        } catch (error) {
            return res.status(401).json({message:"Not authorized, token failed"})
        }
    }
    if(!token){
        return res.status(401).json({message:"Not authorized, no token"});
    }
};


module.exports = { protect };