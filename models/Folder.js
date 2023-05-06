const mongoose = require('mongoose');
const { Schema } = mongoose;
const FolderSchema = new Schema({
    // foreign Key which linkes to user collection using its id
    user : {
        type: mongoose.Schema.Types.ObjectId ,
        ref:'user'
    },
    name: {type:String,required:true},
    no_of_files:{
        type:Number,
        default:0
    },

    // size in bytes
    server_file_storage:{
        type:Number,
        default:0
     },
    date:{
        type:Date,
        default:Date.now
    }
});
module.exports = mongoose.model('folder', FolderSchema)