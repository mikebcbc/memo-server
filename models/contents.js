const mongoose = require('mongoose');

const {Topic} = require('./topics');

const contentSchema = mongoose.Schema({
	type: {type: String, required: true},
	title: {type: String, required: true},
	link: {type: String, required: true},
	related_topics: [{type: mongoose.Schema.Types.ObjectId, ref: 'Topic'}]
});

const Content = mongoose.model('Content', contentSchema);

module.exports = {Content};