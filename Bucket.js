
const mongoose = require('mongoose')
const createBucket = (bucketname)=>{
let bucket;
mongoose.connection.on("connected", () => {
  var db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: bucketname
  });
  console.log(bucket,`\nbucket ${bucketname} created`); 
  
});
return bucket
}
module.exports  = createBucket;