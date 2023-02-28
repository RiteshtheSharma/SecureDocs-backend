// mongodb://localhost:27017/?directConnection=true
const mongoose = require('mongoose')
const mongoUrl = 'mongodb://localhost:27017/?directConnection=true' 
const connectToMongo = ()=>{
    mongoose.connect (mongoUrl,()=>{
        console.log('\nConnection to mongoose sucessfully \n')
    });
} 
module.exports = connectToMongo;