
const mongoose = require('mongoose')
//Help to acess .env 's env varuiable using custom-env package 
// Pass true to env() to make it use the current environment stage.
require ('custom-env').env('local')

const Mongodb_Api = process.env.DATABASE_API;
const connectToMongo = ()=>{
    mongoose.connect (Mongodb_Api,()=>{
        console.log('\nConnection to mongoose sucessfully \n' )
    });
} 
module.exports = connectToMongo;