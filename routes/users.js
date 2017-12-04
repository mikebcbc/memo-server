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

/* GET completed content */
router.get('/completed-content', jwtAuth, (req, res) => {
  User.findOne({username: req.user.username}).populate({
    path: 'content.contentId',
    populate: {
      path: 'related_topic'
    }
  })
  .then(user => {
    const completed = user.content.filter((content) => content.completed);
    res.send(completed);
  })
})

/* POST new user-specific content */
router.post('/content', [jsonParser, jwtAuth], (req, res) => {
  User.findOne({username: req.user.username})
  .then(user => {
  	const doesMatch = user.content.findIndex((content) => {
  		return content.contentId == req.body.contentId;
  	});
  	if (doesMatch != -1) {
  		user.content[doesMatch].time += req.body.time;
  	} else {
  		const newContent = {
  			"contentId": req.body.contentId,
  			"time": req.body.time
  		}
  		user.content.push(newContent);
  	}
    user.save(function(err, user) {
      if (err) {
        return res.status(400).send(`Bad request: ${err.message}`);
      }
      res.json(user.apiRepr());
    })
  })
});

module.exports = router;
