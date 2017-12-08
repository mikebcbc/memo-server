const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const {Content} = require('./contents');

const userSchema = mongoose.Schema({
	username: {type: String, required: true},
	password: {type: String, required: true},
	content: [{
		contentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Content'},
		time: Number,
		completed: Boolean,
		_id: false
	}]
});

userSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    content: this.content || []
  };
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = {User};