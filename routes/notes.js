const express = require('express');
const Notes = require('../models/Notes');
const router = express.Router() 

router.get('/',(req,res)=>{
    console.log('\n\n',req.body);
    const note = Notes(req.body);
    note.save();
    res.send(req.body);
    })
    module.exports = router