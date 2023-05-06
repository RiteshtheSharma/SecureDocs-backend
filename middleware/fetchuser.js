var jwt = require('jsonwebtoken');
require ('custom-env').env('local')
const fetchuser =(req,res,next)=>{
// GEt the user from the jwt token and add id to req obj
const token = req.header('auth-token');
console.log(req.header,'yahi hai ')
if(!token){
    res.status(401).json({errors:'Please authenticate using a valid token'})
}
try {const data = jwt.verify(token,process.env.JWT_SECRET);
    console.log('in fetch user',data)
    req.user= data.user ;
    next()
    
} catch (error) {
    console.log("error! ",error)
    res.status(401).send("Some server error")
}
}
module.exports = fetchuser