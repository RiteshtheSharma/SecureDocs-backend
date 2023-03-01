const express = require('express');
const User = require('../models/User');

const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create a user using POST "/api/auth" Doesn' t require auth
router.post('/',[
    body('email',"Enter a valid email").isEmail(),
    body('name',"Enter a valid name").isLength({ min: 3 }),
    body('password',"Enter a valid password(must be atleast 5 characters)").isLength({ min: 5 })

],(req,res)=>{
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
        // date: req.body.date,
      }).then(user => res.json(user))
      .catch(err =>{console.log("here we are interrupted by error : ",err);res.json({error:'Please enter a valid value for email',message : err.message})});
   
    
})
module.exports = router