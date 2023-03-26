const express = require('express');
const Note = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require("express-validator");
const router = express.Router() 
//Router 1 : GEt all notes using : GET "api/note/getuser" . LOgin required
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try {
      // find all notes whose user field(fk) = user id associated with jwt token 
      const notes = await Note.find({user:req.user.id});
        res.json(notes)
    } catch (error) {
        console.log("error :( ->\n", err.message);
      res.status(500).send({ errors: "Internal server error" });
    }
    })
    //Router 2 : add note using : POST "api/note/addnote" . LOgin required
router.post('/addnote',fetchuser,[
body("title","Title is too short").trim().isLength({ min: 3 }),
body("description","Description must be atleast 5 caracters").trim().isLength({ min: 5 }),

],async (req,res)=>{
    try {// validate title and description against constraints 
      const errors = validationResult(req);
      // if there is errors in newly sent notes fields return bad request and the errors
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // destructuring title,description,tag from req json
     const {title,description,tag} = req.body;
    // creating another notes document associated with user id which is encoded in sent jwt (to fetchuser middleware)
    const note = new Note(
      {title :title,
        description:description,
        tag:(tag.length?tag:'General'),
        user :req.user.id

      }
      
    )
    
    const savedNote = await note.save();
    res.json(savedNote)
    } catch (error) {
        console.log("error :( ->\n", error.message);
      res.status(500).send({ errors: "Internal server error" });
    }
    })

//Router 3 : Update an existing note using : PUT "api/note/updatenote" . LOgin required
router.put('/updatenote/:id',fetchuser,async (req,res)=>{
  try {const {title,description,tag} = req.body;
  //create a newNote obj 
  const newNote = {};
  if(title){newNote.title = title};
  if(description){newNote.description = description};
  if(tag){newNote.tag = (tag.length?tag:'General')};
  
  // find the note to be updated and update it
  let note = await Note.findById(req.params.id);
  // if note with given id not found the send 404 status
  if(!note){
   return  res.status(404).send("Not Found")
  }
  //check whether the user is requesting for his/her own note to update 
  if(note.user.toString() !== req.user.id){
    return res.status(401).send("Unauthorized");
  
  }
  //update the note 
  note= await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
  res.json(note);
    
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send({ errors: "Internal server error" });
  }



})





//Router 4 : Delete an existing note using : delete "api/note/deletenote" . LOgin required
router.delete('/deletenote/:id',fetchuser,async (req,res)=>{
  try {

  
  // find the note to be deleted and delete it
  let note = await Note.findById(req.params.id);
  // if note with given id not found the send 404 status
  if(!note){
   return  res.status(404).send("Not Found")
  }
  //check whether the user is requesting for his/her own note to delete 
  if(note.user.toString() !== req.user.id){
    return res.status(401).send("Unauthorized");
  
  }
  //delete the note 
  note= await Note.findByIdAndDelete(req.params.id)
  res.json({"sucess":"Deleted sucessfully",note:note});
    
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send({ errors: "Internal server error" });
  }
  
})

//Router 5 : GEt all notes with given searchterm and type (title/tag/description) using : POST "api/note/getuser" . LOgin required
router.post('/searchnotes',fetchuser,async (req,res)=>{
    try {
        let {term,type} =req.query;

      term = new RegExp(term.toLowerCase(),'i');

      type= type.toLowerCase()

      let notes;
      if(type==="title")
       // find all notes whose user field(fk) = user id associated with jwt token & title has all letters in term
   
       notes = await Note.find({user:req.user.id,title:{$regex:term}});
      else if(type==="description")
       // find all notes whose user field(fk) = user id associated with jwt token & description  has all letters in term
   
       notes = await Note.find({user:req.user.id,description:{$regex:term}});
       else if(type==="tag")
        // find all notes whose user field(fk) = user id associated with jwt token & tag  has all letters in term
   
       notes = await Note.find({user:req.user.id,tag:{$regex:term}});
     else{
 // throw error if type is not title,tag or description
return   res.status(404).send("Type desn 't match")
     }
      return   res.json( notes)
    } catch (error) {
        console.log("error :( ->\n", error.message);
      res.status(500).send({ errors: "Internal server error" });
    }
    })
    module.exports = router