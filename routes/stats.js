const express = require('express');
const router = express.Router();

const {Topic} = require('../models/topics');

/* GET users listing. */
router.get('/topics', (req, res) => {
  Topic.find().then(topics => {
  	res.json(topics);
  });
});

module.exports = router;
