const mongoose = require('mongoose');

const {Content} = require('./contents');

const userSchema = mongoose.Schema({
	username: {type: String, required: true},
	content: [{
		contentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Content'},
		time: Number,
		completed: Boolean
	}]
});

const User = mongoose.model('User', userSchema);

module.exports = {User};