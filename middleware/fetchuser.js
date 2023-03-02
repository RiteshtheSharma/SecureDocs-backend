var jwt = require('jsonwebtoken');
require ('custom-env').env('local')
const fetchuser =(req,res,next)=>{
// GEt the user from the jwt token and add id to req obj
const token = req.header('auth-token');
if(!token){
    res.status(401).json({error:'Please authenticate using a valid token'})
}
try {const data = jwt.verify(token,process.env.JWT_SECRET);
    req.user= data.user ;
    next()
    
} catch (error) {
    res.status(401).send({error:"Some server error"})
}
}
module.exports = fetchuser