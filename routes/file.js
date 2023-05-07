const express = require('express');
const File = require('../models/File');
const User = require('../models/User')
const fetchuser = require('../middleware/fetchuser')
const fetchfolder = require('../middleware/fetchfolder')
const { body, validationResult } = require("express-validator");
const Folder = require('../models/Folder');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router() 
const bcrypt = require('bcryptjs');
const multer = require("multer");
const fs = require('fs')
const FS = require('fs/promises');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path= require('path')
const storage = multer.diskStorage(
  {
      destination:function(req,file,cb){
         console.log(req.folder,req.user)
          if(!fs.existsSync('public')){
              fs.mkdirSync('public')
          }
          if(!fs.existsSync(`public/${req.user.id}`)){
              fs.mkdirSync(`public/${req.user.id}`)
             
          }
          if(!fs.existsSync(`public/${req.user.id}/${req.folder}`)){
            fs.mkdirSync(`public/${req.user.id}/${req.folder}`)
           
        }
          console.log("in multer middleware",file)
         
          cb(null,`public/${req.user.id}/${req.folder}`)
      },
      filename:function(req,file,cb){
          
cb(null,Date.now()+file.originalname.trim().split(' ').join('_'))
      }
  }
)


const upload = multer({
  storage
});

//Router 1 : GEt all files of a folder using : GET "api/file/fetchfiles" . LOgin required
router.get('/fetchfiles',fetchuser,fetchfolder,async (req,res)=>{
  try {

    
    // find all folders whose user field(fk) = user id associated with jwt token 
    const files = await File.find({user:req.user.id,folder:req.folder});
      res.json(files)
  } catch (error) {
      console.log("error :( ->\n", err.message);
    res.status(500).send("Internal server error" );
  }
  }) 
    
  //Router 2 : GEt all files using : GET "api/file/fetchallfiles" . LOgin required
router.get('/fetchallfiles',fetchuser,async (req,res)=>{
  try {
    // find all files whose user field(fk) = user id associated with jwt token 
    const files = await File.find({user:req.user.id});
      res.json(files)
  } catch (error) {
      console.log("error :( ->\n", err.message);
    res.status(500).send("Internal server error" );
  }
  }) 

    //Router 3 : add file using : POST "api/file/addfile" . LOgin required
    router.post('/addfile',fetchuser,fetchfolder,upload.single("file"),[  
      body("name","Please specify file name").trim().notEmpty().withMessage('file shouldn \'t be empty').matches(/^[\w ]+$/).withMessage("Please give a valid file name"),
     ],async (req,res)=>{
      const {name} = req.body;
      console.log(name,": name ")
      // validatefolder name against constraints 
      const errors = validationResult(req);
      // if there is errors in newly sent folder fields return bad request and the errors
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // console.log("in api ,body : ",req.body)
      // console.log(req)

      try {
        console.log(' here')
       const folder = await Folder.findById(req.folder) 
       if(folder.user.toString() !== req.user.id){
        return res.status(401).send("Unauthorized");
      
      }

      let f = await File.findOne({ name: name })
      if (f) {
        return res
          .status(400)
          .json({ errors: "Sorry a file with the same name exists" });
      }




// size in bytes
        const file = await File.create({
name,
 path: req.file.path ,
 user:req.user.id,
 folder:req.folder,
 type:req.file.path.slice(req.file.path.indexOf('.')+1),
 size:req.file.size,

 })
 Folder.updateOne(
  { _id: req.folder }, { $inc: { no_of_files: 1,server_file_storage:req.file.size, } }, function(err, result) {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
    }
  }
 )
User.updateOne(
  {$id: req.user.id},
  { $inc: { no_of_files: 1,total_server_file_storage:req.file.size, } }, function(err, result) {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
    }
  }
)


res.json({file})

      } catch (error) {
          console.log("error :( ->\n", error.message);
        res.status(500).send( "Internal server error" );
      }
      })




  //Router 4 : share file using : POST "api/file/sharefile" by adding file in account associated with given emailid or share it in email . LOgin required
  router.post('/sharefile',fetchuser,fetchfolder,[
    body("email", "Enter a valid email").isEmail().trim().normalizeEmail(),
    body(
      "pwd",
      "Enter a valid password(must be atleast 5 characters)"
    ).isLength({ min:4 }),
   
  ],async (req,res)=>{
    //fileid is id if file to be shared to user with given "email" ,
    //pwd field will be false if pwd is not required else suitable pwd will be passed 
    //pwd will be false in case where file is shared via securedocs account else suitable pwd is needed
    const {fileid,email,pwd} = req.body;
    // console.log("in api ,body : ",req.body)
    // console.log(req)
// validate email and pwd against constraints (if proper email format is followed and pwd 's length >=5 )
const errors = validationResult(req);
// if there is errors in credentials return bad request and the errors
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

    try {
    // Sec_user is the user to whom file is shared
    const Sec_user = await User.findOne({email:email});
    //send error response if no user with given email is not found 
    if(!Sec_user && pwd==='false'){
     return res
       .status(400)
       .json({ errors: "Any user with given email Id doesn 't exists" });
   }
    
    const folder = await Folder.findById(req.folder) 
    console.log(folder,'egg',req.folder)
    if(!folder){
     return res.status(401).send("Unauthorized");
   
   }
   
   const file = await File.findById(fileid)
   
  if(req.folder!==file.folder.toString()){
    return res.status(401).send("Unauthorized");
   
  }
if(pwd === 'false'){  
  let shareFolder = await Folder.findOne({ user: Sec_user._id.toString(),name:"share" })

  if(!shareFolder){
    share = await Folder.create({ user: Sec_user._id.toString(),name:"share" })
  }
// duplicating file and save in server under new user 's folder is left 
  const  newfile = await File.create({
    name: file.name ,
   path: file.path ,
   user:Sec_user._id.toString(),
   folder:share._id.toString(),
   type:file.type,
   size:file.size,

   }) 
  

return res.json({newfile})  }
else{
  const inputFile = file.path;
  const f = 'temp'+file.path.slice(file.path.lastIndexOf('.'))
  const outputFile = `${f.slice(0,f.indexOf('.'))}-locked${f.slice(f.indexOf('.'))}`;
  const password = pwd;


  createZipFile(inputFile, outputFile, password)
    .then(async () => {
      
      const zipFile = `${outputFile}`;
      const emailOptions = {
        to: email,
        subject: 'Locked file',
        text: 'Please find the locked file attached.',
        filename: zipFile ,
      };
    
     await sendEmail(zipFile, emailOptions)
        .then(() => {
          console.log('Email sent successfully.');
          res.status(200).send('Email sent successfully.');
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error sending email.');
        })
       
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error creating zip file.');
    })
    .finally(() => {
      // Delete the temporary files
     
      fs.unlink(outputFile, (err) => {
        if (err) console.error(err);
      });

    });

}

    } catch (error) {
        console.log("error :( ->\n", error.message);
      res.status(500).send( "Internal server error" );
    }
    })

//Router 3 : Update an existing file name using : PUT "api/file/updatefilename/:id" . LOgin required
router.put('/updatefilename/:id',fetchuser,fetchfolder,[
  body("name","Please specify file name").trim().notEmpty().matches(/^[\w ]+$/),
  
  
  ],async (req,res)=>{
  try {
   

    // validatefolder name against constraints 
    const errors = validationResult(req);
    // if there is errors in newly sent folder fields return bad request and the errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // checking if updated folder name is valid

    const {name} = req.body;

    
  //create a newFolder obj 
  const newFile = {};
  if(name){newFile.name = name};
 
  
  // find the folder to be updated and update it
  let file = await File.findById(req.params.id);
  // if folder with given id not found the send 404 status
  if(!file){
   return  res.status(404).send("Not Found")
  }

  //check whether the user is requesting for his/her own folder to update 
  const folder = await Folder.findById(req.folder) 
  console.log(' reality ',folder)
    if(folder.user.toString() !== req.user.id){
     return res.status(401).send("Unauthorized");
   
   }
  
   if(req.folder!==file.folder.toString()){
    return res.status(401).send("Unauthorized");
   
  }

  //update the folder
  file= await File.findByIdAndUpdate(req.params.id,{$set:newFile},{new:true})

  res.json(file);
    
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send( "Internal server error" );
  }



})
  //Router 4 : Delete an existing file using : delete "api/file/deletefile/:id" . LOgin required
router.delete('/deletefile/:id',fetchuser,fetchfolder,async (req,res)=>{
  try {

  


  let folder = await Folder.findById(req.folder);
  //check whether the user is requesting for his/her own file to delete 
  if(folder.user.toString() !== req.user.id){
    return res.status(401).send("Unauthorized");
  
  }
    // find the file to be deleted and delete it
    let file = await File.findById(req.params.id);
    // if file with given id not found the send 404 status
    console.log(file," for file ")
    if(!file){
     return  res.status(404).send("Not Found")
    }
  if(req.folder!==file.folder.toString()){
    return res.status(401).send("Unauthorized");
   
  }
 // delete all file documents linked to the folder and multer generated files 
 file = await File.findOne({_id:req.params.id})
 const path =file.path;// assign path 
 
 fs.unlink(path, err => {
  if (err) {
    console.log('error while deleting multer file',err)
    throw err
  }

  console.log(`file is deleted!`)
})
  //delete the file document

  Folder.updateOne(
    { _id: req.folder }, { $inc: { no_of_files: -1,server_file_storage:file.size, } }, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        console.log(result);
      }
    }
   )
  User.updateOne(
    {$id: req.user.id},
    { $inc: { no_of_files: -1,total_server_file_storage:file.size, } }, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        console.log(result);
      }
    }
  )
   file = await File.deleteOne({_id:req.params.id})
  res.json({"sucess":"Deleted sucessfully",folder:folder});
    
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send( "Internal server error" );
  }
  
})





function unzipFile(inputFile, outputFile, password){
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputFile);
    const output = fs.createWriteStream(outputFile);
   
const  key = crypto.createHash('sha256').update(password).digest()
                    

const iv = crypto.createHash('md5').update(password).digest()

    const cipher = crypto.createDecipheriv('aes-256-cbc', key,iv);
    input.pipe(cipher).pipe(output);

    output.on('finish', function() {
      
      console.log(
        'archiver has been finalized and the output file descriptor has closed.'
      );
      resolve();
    });

    // archive.on('error', function(err) {
    //   reject(err);
    // });

    // archive.pipe(cipher).pipe(output);

    // archive.file(inputFile, { name: 'file' });
    // archive.finalize();
  });


}
function createZipFile(inputFile, outputFile, password) {
  return new Promise((resolve, reject) => {
    try{const input = fs.createReadStream(inputFile);
      const output = fs.createWriteStream(outputFile);
    
  const  key = crypto.createHash('sha256').update(password).digest()
                      
  
  const iv = crypto.createHash('md5').update(password).digest()
  
      const cipher = crypto.createCipheriv('aes-256-cbc', key,iv);
     
      input.pipe(cipher).pipe(output);
    
     
      output.on('finish', function() {
        
        console.log(
          'archiver has been finalized and the output file descriptor has closed.'
        );
        resolve();
      });}
    
   catch(e){
    console.log("the error :",e)
   }

    // archive.on('error', function(err) {
    //   reject(err);
    // });

  });
}

 async function sendEmail(outputFile, emailOptions) {const testAccount = await nodemailer.createTestAccount();
  return new Promise((resolve, reject) => {

    // get credentials from ethreal site 
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'gerry.ortiz41@ethereal.email',
          pass: '2kkFWmXzRTxCA2amNN'
      }
  });

    const zipFile = `${outputFile}`;
    
    const mailOptions = {
      from: '<raam_raam@ty.ioo>',
      to: emailOptions.to,
      subject: emailOptions.subject,
      text: emailOptions.text,
      attachments: [
        {
          filename: `${emailOptions.filename}`,
          path: zipFile,
        },
      ],
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve();
      }
    });
  });
}
    module.exports = router