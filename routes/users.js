const express = require('express');
const router = express.Router();

const {User} = require('../models/users');

/* GET users listing. */
router.get('/', (req, res) => {
  User.find().populate({
  	path: 'content.contentId',
  	populate: {
  		path: 'related_topics'
  	}
  }).then(user => {
  	res.json(user);
  });
});

module.exports = router;
