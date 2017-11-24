const express = require('express');
const router = express.Router();

const {User} = require('../models/user');

/* GET users listing. */
router.get('/', (req, res) => {
  User.find().then(user => {
  	res.json(user);
  });
});

module.exports = router;
