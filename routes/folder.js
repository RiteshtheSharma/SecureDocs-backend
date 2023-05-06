const express = require('express');
const Folder = require('../models/Folder');
const File = require('../models/Folder')
const fetchuser = require('../middleware/fetchuser');
const User = require('../models/User')
const { body, validationResult } = require("express-validator");
const fs = require('fs');
const { ResultWithContext } = require('express-validator/src/chain');
const router = express.Router() 
//Router 1 : GEt all folders using : GET "api/folder/fetchallfolders" . LOgin required
router.get('/fetchallfolders',fetchuser,async (req,res)=>{
    try {
      // find all folders whose user field(fk) = user id associated with jwt token 
      const folders = await Folder.find({user:req.user.id});
        res.json(folders)
    } catch (error) {
        console.log("error :( ->\n", err.message);
      res.status(500).send("Internal server error" );
    }
    })
    //Router 2 : add folder using : POST "api/folder/addfolder" . LOgin required
router.post('/addfolder',fetchuser,[
body("name","Please specify folder name").trim().notEmpty().withMessage('Please specify folder name').matches(/^[\w ]+$/).withMessage("Please give a valid folder name"),
    


],async (req,res)=>{
    try {// validatefolder name against constraints 
      const errors = validationResult(req);
      // if there is errors in newly sent folder fields return bad request and the errors
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // destructuring name from req json
     const {name} = req.body;
     let folder = await Folder.findOne({ name: name })
      if (folder) {
        return res
          .status(400)
          .json({ errors: "Sorry a folder with the same name exists" });
      }
    

    // creating another folder document associated with user id which is encoded in sent jwt (to fetchuser middleware)
     folder = new Folder(
      {
        user :req.user.id,
        name:name

      }
      
    )
    await User.findByIdAndUpdate( req.user.id , { $inc: { no_of_folders: 1 } },{new:true});
    const savedFolder = await folder.save();
    res.json( savedFolder)
    } catch (error) {
        console.log("error :( ->\n", error.message);
      res.status(500).send( "Internal server error" );
    }
    })

//Router 3 : Update an existing folder using : PUT "api/folder/updatefoldername/:id" . LOgin required
router.put('/updatefoldername/:id',fetchuser,[
  body("name","Please specify folder name").trim().notEmpty().matches(/^[\w ]+$/),
  
  
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
  const newFolder = {};
  if(name){newFolder.name = name};
 
  
  // find the folder to be updated and update it
  const folder = await Folder.findById(req.params.id);
  // if folder with given id not found the send 404 status
  if(!folder){
   return  res.status(404).send("Not Found")
  }
  //check whether the user is requesting for his/her own folder to update 
  if(folder.user.toString() !== req.user.id){
    return res.status(401).send("Unauthorized");
  
  }
  const files = File.

  //update the folder
  folder= await Folder.findByIdAndUpdate(req.params.id,{$set:newFolder},{new:true})

  res.json(folder);
    
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send( "Internal server error" );
  }



})

/*
Route 4 under construction 
    |
    |
    |
    
*/

//Router 4 : Delete an existing folder using : delete "api/folder/deletefolder/:id" . LOgin required
router.delete('/deletefolder/:id',fetchuser,async (req,res)=>{
  try {

  
  // find the folder to be deleted and delete it
  let folder = await Folder.findById(req.params.id);
  // if folder with given id not found the send 404 status
  if(!folder){
   return  res.status(404).send("Not Found")
  }
  //check whether the user is requesting for his/her own folder to delete 
  if(folder.user.toString() !== req.user.id){
    return res.status(401).send("Unauthorized");
  
  }
 // delete all file documents linked to the folder and multer generated files 
 const files = await File.deleteMany({folder:req.params.id, user:req.user.id})
 if (fs.existsSync(`../public/${req.user.id}/${req.params.id}`)) {
  console.log('Folder exists');
  fs.rm(`../public/${req.user.id}/${req.params.id}`, { recursive: true }, err => {
    if (err) {
      console.log('error while deleting multer folder and files',err)
      throw err
    }
  
    console.log(`dir is deleted!`)
  })
} 
console.log(folder,'folders ')
await User.findByIdAndUpdate( req.user.id , { $inc: { no_of_folders: -1,no_of_files:-1*(folder.no_of_files),total_server_file_storage:-1*(folder.server_file_storage) } });
  //delete the folder
  folder= await Folder.deleteOne({ _id: folder._id,user:req.user.id })
  res.json({"sucess":"Deleted sucessfully",folder:folder});
    
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send( "Internal server error" );
  }
  
})


    module.exports = router