const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');

const {User} = require('../models/users');

const jwtAuth = passport.authenticate('jwt', { session: false });

/* GET user content/info */
router.get('/', jwtAuth, (req, res) => {
  User.findOne({username: req.user.username}).populate({
  	path: 'content.contentId',
  	populate: {
  		path: 'related_topic'
  	}
  }).then(user => {
  	res.json(user.apiRepr());
  });
});

/* POST new user */
router.post('/register', jsonParser, (req, res) => {
	let {username, password} = req.body;

	return User.find({username})
		.count()
		.then(count => {
			if (count > 0) {
				return Promise.reject({
					code: 422,
					reason: 'Validation Error',
					message: 'Username is already taken'
				});
			}
			return User.hashPassword(password);
		})
		.then(hash => {
			return User.create({
				username,
				password: hash,
				content: []
			});
		})
		.then(user => {
			return res.status(201).json(user.apiRepr());
		})
		.catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

module.exports = router;
