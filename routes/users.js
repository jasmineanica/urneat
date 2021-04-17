const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require("../models/User");

// @route     POST api/users
// @desc      Register a user
// @access    Public
router.post('/', [
  check('name', 'Plase enter a name').not().isEmpty(),
  check('username', 'Please enter a username').not().isEmpty(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6})
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array()});
  }

  const { name, username , password } = req.body;

  try {
    let user = await User.findOne({ username: username });
    if (user) {
      return res.status(400).json({ msg: "User already exists"});
    }

    user = new User({
      name: name,
      username: username,
      password: password
    });

    // need to encrypt the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.send('user saved');
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
