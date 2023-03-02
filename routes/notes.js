const express = require('express');
const Notes = require('../models/Notes');
const fetchuser = require('../middleware/fetchuser')
const router = express.Router() 
//Router 1 : GEt all notes using : GET "api/auth/getuser" . LOgin required
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try {

        
    } catch (error) {
        console.log("error :( ->\n", err.message);
      res.status(500).send({ errors: "Internal server error" });
    }
    })
    module.exports = router