const express = require('express');
const passport = require('passport');
const bodyParser = requiure('body-parser');
const jwt = reqire('jsonwebtoken');
const router = express.Router();

const createToken = (user) => {
	return jwt.sign({user}, process.env.JWT_SECRET, {
		subject: user.username,
		expiresIn: 3600,
		algorithm: 'HS256'
	});
};

const localAuth = passport.authenticate('local', {session: false});
router.use(bodyParser.json());

/* POST login */
router.post('/login', localAuth, (req, res) => {
	const authToken = createToken(req.user.apiRepr());
	res.json({authToken});
});

module.exports = router;
