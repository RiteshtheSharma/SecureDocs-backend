const express = require("express");
const User = require("../models/User");
const Note = require('../models/Note');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const fetchuser = require('../middleware/fetchuser')
const { body, validationResult } = require("express-validator");
const { findOne } = require("../models/User");

const router = express.Router();

// Create a user using POST "/api/auth" Doesn' t require auth

// ROUTE 1 : createuser endpoint 
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail().trim().normalizeEmail(),
    body("name", "Enter a valid name").isLength({ min: 3 }).trim(),
    body(
      "password",
      "Enter a valid password(must be atleast 5 characters)"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    console.log(req.body);
    // validate email and pwd against constraints (if proper email format is followed and pwd 's length >=5 )
    const errors = validationResult(req);
    // if there is errors in credentials return bad request and the errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // check whether the user with same email exists already
    try {
    
      let user = await User.findOne({ email: req.body.email })
      if (user) {
        return res
          .status(400)
          .json({ errors: "Sorry a user with the same Email exists" });
      }
      //create a encryption of pwd+ salt
      const salt = await bcrypt.genSalt(10);
      const HashedPwd =await bcrypt.hash(req.body.password,salt)
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password:HashedPwd,
        
      });
  // creating js object as payload in jwt 
const data = {
  user:{id:user.id}
}
//genetating awt on the basis of signature and data
const AUTH_TOKEN = jwt.sign(data, process.env.JWT_SECRET)
       res.json({AUTH_TOKEN});
      
    } catch (err) {
      console.log("error :( ->\n", err.message);
      res.status(500).json({ errors: "some error occured" });
    }
  }
);

//ROUTE 2 : login endpoint
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail().trim().normalizeEmail(),
    body(
      "password",
      "Enter a valid password(must be atleast 5 characters)"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    // validate email and pwd against constraints (if proper email format is followed and pwd 's length >=5 )
    const errors = validationResult(req);
    // if there is errors in credentials return bad request and the errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

     //destructuring sent json in email and password
      const {email,password} = req.body;
      try {
      //finding any user in database  with an email id entered in login details
      
      let user = await User.findOne({email:email});
      //send error response if no user with given email is not found 
      if(!user){
        return res
          .status(400)
          .json({ errors: "Any user with given email Id doesn 't exists" });
      }
      const passwordCompare = await bcrypt.compare(password,user.password);
      if(!passwordCompare){
        return res.status(400).json({errors:'Please provide a valid password for corresponding email id'})
      }
      
const data = {
  user:{id:user.id}
}
const AUTH_TOKEN = jwt.sign(data, process.env.JWT_SECRET)
       res.json({AUTH_TOKEN});
      
    } catch (err) {
      console.log("errors :( ->\n", err.message);
      res.status(500).send({ errors: "Internal server error" });
    }
  }
);
//ROUTE 3 : Get logged in user details using POST request . login required
router.post('/getuser',fetchuser,async(req,res)=>{
try {const userID = req.user.id
//fetch all related  key: value related to given userID except password
   const user = await User.findById(userID).select('-password')
  res.json(user)
} catch (err) {
  console.log("error :( ->\n", err.message);
      res.status(500).send({ errors: "Internal server error" });
}
})
//ROUTE 4 : update logged in useremail using PUT request . login required
router.put('/updateemail',[
  body("email", "Enter a valid email").isEmail().trim().normalizeEmail(),],fetchuser,async (req,res)=>{
  try {const {email} = req.body;
 // validate email against constraints (if proper email format is followed  )
 const errors = validationResult(req);
 // if there is errors in email format return bad request and the errors
 if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
 }

  let user = await User.findOne({email:email});
      //send error response if no given email is already in use
      if(user){
        return res
          .status(400)
          .json({ errors: "You can 't use this email id" });
      }
  // comes from middleware fetchuser
  const userID = req.user.id;

  const UpdatedUser= await User.findByIdAndUpdate(userID ,{$set:{ email:email }},{new:true})
  res.json(UpdatedUser);
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send({ errors: "Internal server error" });
  }



})
//ROUTE 5 : update logged in user password using PUT request . login required
router.put('/updatepassword',[body(
  "password",
  "Enter a valid password(must be atleast 5 characters)"
).isLength({ min: 5 }),],fetchuser,async (req,res)=>{
  try {const {password} = req.body;
  // validate password against constraints 
  const errors = validationResult(req);
  // if there is errors in password return bad request and the errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userID = req.user.id;
  const salt = await bcrypt.genSalt(10);
  const HashedPwd =await bcrypt.hash(req.body.password,salt)
  const UpdatedUser= await User.findByIdAndUpdate(userID ,{$set:{ password:HashedPwd}},{new:true})
  res.json(UpdatedUser);
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send({ errors: "Internal server error" });
  }



})
//ROUTE 5 : delete logged in user account and all notes related to him/ner using DELETE request . login required
router.delete('/deleteuseraccount',fetchuser,async (req,res)=>{
  try {
  const userID = req.user.id;
  // find all notes whose user field(fk) = user id associated with jwt token 
  const notes = await Note.deleteMany({user:userID });
  const user = await User.deleteOne({_id:userID});
  res.json(notes);
  } catch (error) {
    console.log("error :( ->\n", error.message);
    res.status(500).send({ errors: "Internal server error" });
  }



})
module.exports = router;
