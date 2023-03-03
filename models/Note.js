const mongoose = require('mongoose');
const { Schema } = mongoose;
const NoteSchema = new Schema({
    // foreign Key which linkes to user collection using its id
    user : {
        type: mongoose.Schema.Types.ObjectId ,
        ref:'user'
    },
    title: {type:String,required:true},
   
    description:{
        type:String,
        required:true,
        
    },
    tag:{
        type:String,
        default:'General'
        
    },
    date:{
        type:Date,
        default:Date.now
    }
});
module.exports = mongoose.model('note', NoteSchema )