const express = require("express");
const User = require("../models/User");

const { body, validationResult } = require("express-validator");

const router = express.Router();

// Create a user using POST "/api/auth" Doesn' t require auth
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
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry a user with the same Email exists" });
      }
      //create a user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        // date: req.body.date,
      });

      //   .then(user => res.json(user))
      //   .catch(err =>{console.log("here we are interrupted by error : ",err);res.json({error:'Please enter a valid value for email',message : err.message})});
      res.json(user);
      
    } catch (err) {
      console.log("error :( ->\n", err.message);
      res.status(500).json({ errors: "some error occured" });
    }
  }
);
module.exports = router;
