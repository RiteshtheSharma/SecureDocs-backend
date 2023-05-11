const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserSchema = new Schema({
    name: {type:String,required:true},
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:true
    },
    no_of_folders:{
        type:Number,
        default:0
        ,validate: {
            validator: function(value) {
              return value >= 0;
            },
            message: props => `${props.value} is not a positive number!`
          }
    },
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
    total_server_file_storage:{
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
    },
});
/*
User.createIndexes(); resolves an issue that is - if the user submits the request two times with the same ‘Name’ and ‘Email’ then the two different entries of Data are stored in the database. This means that we are not getting the unique email for each submitted data.

*/
const User = mongoose.model('user', UserSchema);

module.exports = User;
