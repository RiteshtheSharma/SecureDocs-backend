const express = require("express");
const User = require("../models/User");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Create a user using POST "/api/auth" Doesn' t require auth
// create user endpoint 
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
          .json({ error: "Sorry a user with the same Email exists" });
      }
      //create a user
      const salt = await bcrypt.genSalt(10);
      const HashedPwd =await bcrypt.hash(req.body.password,salt)
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password:HashedPwd,
        
      });
const data = {
  user:{id:user.id}
}
const AUTH_TOKEN = jwt.sign(data, process.env.JWT_SECRET)
       res.json({AUTH_TOKEN});
      
    } catch (err) {
      console.log("error :( ->\n", err.message);
      res.status(500).json({ errors: "some error occured" });
    }
  }
);

//login endpoint



module.exports = router;
