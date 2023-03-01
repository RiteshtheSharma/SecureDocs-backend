// mongodb://localhost:27017/?directConnection=true
const mongoose = require('mongoose')
const mongoUrl = 'mongodb+srv://AdminAlpha:eM5CAHgjb5fa3M0j@cluster0.5aucxhy.mongodb.net/?retryWrites=true&w=majority' 
const connectToMongo = ()=>{
    mongoose.connect (mongoUrl,()=>{
        console.log('\nConnection to mongoose sucessfully \n')
    });
} 
module.exports = connectToMongo;