const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');

const {User} = require('../models/users');

const jwtAuth = passport.authenticate('jwt', { session: false });

const userRouter = (io) => {
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
  });

  /* POST new user-specific content */
  router.post('/content', [jsonParser, jwtAuth], (req, res) => {
    User.findOne({username: req.user.username})
    .then(user => {
    	const doesMatch = user.content.findIndex((content) => {
    		return content.contentId == req.body.content;
    	});
    	if (doesMatch != -1) {
    		user.content[doesMatch].time += +req.body.time;
        user.content[doesMatch].completed = req.body.completed;
    	} else {
    		const newContent = {
    			"contentId": req.body.content,
    			"time": req.body.time,
          "completed": req.body.completed
    		}
    		user.content.push(newContent);
    	}
      user.save(function(err, user) {
        if (err) {
          return res.status(400).send(`Bad request: ${err.message}`);
        }
        io.to(req.user.username).emit('reloadState');
        res.json(user.apiRepr());
      })
    })
  });
  return router;
}

module.exports = userRouter;
