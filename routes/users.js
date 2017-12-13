const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');

const {User} = require('../models/users');
const {Content} = require('../models/contents');

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
    let newContent;
    let timeChange;
    User.findOne({username: req.user.username}).populate({
      path: 'content.contentId',
      populate: {
        path: 'related_topic'
      }
    })
    .then(user => {
    	const doesMatch = user.content.findIndex((content) => {
    		return content.contentId._id == req.body.content;
    	});
    	if (doesMatch != -1) {
    		user.content[doesMatch].time += +req.body.time;
        user.content[doesMatch].completed = req.body.completed;
        newContent = user.content[doesMatch];
        timeChange = req.body.time;
        user.save(function(err, user) {
          if (err) {
            return res.status(400).send(`Bad request: ${err.message}`);
          }
          res.json({newContent});
        })
    	} else {
        Content.findById(req.body.content).populate('related_topic')
        .then((content) => {
          newContent = {
            "contentId": content,
            "time": +req.body.time,
            "completed": req.body.completed
          }
          user.content.push(newContent);
          user.save(function(err, user) {
            if (err) {
              return res.status(400).send(`Bad request: ${err.message}`);
            }
            res.json({newContent});
          })
        })
    	}
    })
  });

  router.get('/io/:contentId', [jwtAuth], (req, res) => {
    User.findOne({username: req.user.username}).populate({
      path: 'content.contentId',
      populate: {
        path: 'related_topic'
      }
    })
    .then(user => {
      const content = user.content.find((content) => {
        return content.contentId == req.params.contentId;
      });
      io.to(req.user.username).emit('reloadState', user);
      res.end();
    });
  });
  return router;
}

module.exports = userRouter;
