const express = require('express');
const router = express.Router();

const {Content} = require('../models/contents');

/* GET users listing. */
router.get('/', (req, res) => {
  Content.find().populate('related_topics').then(content => {
  	res.json(content);
  });
});

module.exports = router;
