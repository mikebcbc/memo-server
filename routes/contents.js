const express = require('express');
const router = express.Router();
const passport = require('passport');

const {Content} = require('../models/contents');
const {User} = require('../models/users');
const {Topic} = require('../models/topics');

const jwtAuth = passport.authenticate('jwt', { session: false });

/* GET content listing. */
router.get('/', (req, res) => {
  Content.find().populate('related_topics').then(content => {
  	res.json(content);
  });
});

/* GET reccomended content */
router.get('/rec-content', jwtAuth, (req, res) => {
	let _topics;
	let _content;
	Topic.find({})
	.then(topics => {
		_topics = topics;
		Content.find({})
		.then(content => {
			_content = content;
			User.findOne({username: req.user.username}).populate({
		  	path: 'content.contentId',
		  	populate: {
		  		path: 'related_topic'
		  	}
	  	})
	  	.then(user => {
		  	const countedTopics = () => {
			  		user.content.reduce((acc, curr) => {
						if (acc[curr.related_topic]) {
							acc[curr.related_topic] += 1;
						} else {
							acc[curr.related_topic] = 1;
						}
						return acc;
			  	}, {});
			  }

		  	const sortedTopics = _topics.sort((a, b) => {
		  		const aCount = countedTopics(a._id) || 0;
		  		const bCount = countedTopics(b._id) || 0;
		  		return aCount - bCount;
		  	});

		  	const completedContent = user.content.filter(content => content.completed).map(content=>content._id);

		  	const sortedContent = _content.filter(content => !completedContent.includes(content._id))
		  		.sort((a, b) => {
			  		const aCount = countedTopics(a.related_topic) || 0;
			  		const bCount = countedTopics(b.related_topic) || 0;
			  		return aCount - bCount;
		  		})
		  		res.json(sortedContent);
			})
		})
  })
})

module.exports = router;
