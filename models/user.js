const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	username: {type: String, required: true},
	content: [{
		contentId: Number,
		time: Number,
		completed: Boolean
	}]
});

const User = mongoose.model('User', userSchema);

module.exports = {User};