var jwt = require('jsonwebtoken');
require ('custom-env').env('local')
const fetchfolder =(req,res,next)=>{
// GEt the user from the jwt token and add id to req obj
console.log(req.user.id,"user id")
const folder = req.header('folder');
if(!folder){
    res.status(401).json({errors:'Please give the folder name'})
}
try {
   
    req.folder= folder ;
    next()
    
} catch (error) {
    console.log("error! ",error)
    res.status(401).send("Some server error")
}
}
module.exports = fetchfolder