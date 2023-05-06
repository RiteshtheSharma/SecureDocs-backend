const mongoose = require('mongoose');
const { Schema } = mongoose;
const FileSchema = new Schema({
    
    folder:{ type: mongoose.Schema.Types.ObjectId ,
        ref:'folder'},
    user:{
        type: mongoose.Schema.Types.ObjectId ,
        ref:'user'
    },    
   
    name: {type:String,required:true},
    
    type:{
        type:String,
        required:true,
       
    },
    // size in bytes
    size:{
        type:Number,
        default:0
    },
   path:{type:String,
    required:true
   },
    date:{
        type:Date,
        default:Date.now
    },
 
});
/*
User.createIndexes(); resolves an issue that is - if the user submits the request two times with the same ‘Name’ and ‘Email’ then the two different entries of Data are stored in the database. This means that we are not getting the unique email for each submitted data.

*/
const User = mongoose.model('file', FileSchema);

module.exports = User;
