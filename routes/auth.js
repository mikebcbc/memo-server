const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');
const router = express.Router();

const {User} = require('../models/users');
const jwtAuth = passport.authenticate('jwt', { session: false });

const createToken = (user) => {
	return jwt.sign({user}, process.env.JWT_SECRET, {
		subject: user.username,
		expiresIn: 3600,
		algorithm: 'HS256'
	});
};

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());

/* POST new user */
router.post('/register', (req, res) => {
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
      const authToken = createToken(user.apiRepr());
			return res.json({authToken});
		})
		.catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

/* POST login */
router.post('/login', localAuth, (req, res) => {
	const authToken = createToken(req.user.apiRepr());
	res.json({authToken});
});

/* POST refresh token */
router.post('/refresh', jwtAuth, (req, res) => {
	const authToken = createToken(req.user);
	res.json({authToken});
});

module.exports = router;
