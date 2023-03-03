const express = require('express');
const Note = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require("express-validator");
const router = express.Router() 
//Router 1 : GEt all notes using : GET "api/auth/getuser" . LOgin required
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
    //Router 2 : GEt all notes using : POST "api/auth/addnote" . LOgin required
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
        tag:tag,
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
    module.exports = router