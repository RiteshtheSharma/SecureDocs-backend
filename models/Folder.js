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
        default:0,
        validate: {
            validator: function(value) {
              return value >= 0;
            },
            message: props => `${props.value} is not a positive number!`
          }
    },

    // size in bytes
    server_file_storage:{
        type:Number,
        default:0,
        validate: {
            validator: function(value) {
              return value >= 0;
            },
            message: props => `${props.value} is not a positive number!`
          }
     },
    date:{
        type:Date,
        default:Date.now
    }
});
module.exports = mongoose.model('folder', FolderSchema)