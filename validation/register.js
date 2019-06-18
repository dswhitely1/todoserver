const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateRegisterInput(data) {
	let errors = {};

	data.name = !isEmpty(data.name) ? data.name : '';
	data.username = !isEmpty(data.username) ? data.username : '';
	data.password = !isEmpty(data.password) ? data.password : '';
	data.password2 = !isEmpty(data.password2) ? data.password2 : '';

	if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
		errors.name = 'Your name must be between 2 and 30 characters';
	}

	if (Validator.isEmpty(data.name)) {
		errors.name = 'The name field is required';
	}

	if (!Validator.isLength(data.username, { min: 5, max: 20 })) {
		errors.username = 'Your username must be between 5 and 20 characters';
	}

	if (Validator.isEmpty(data.username)) {
		errors.username = 'Username field is required';
	}

	if (!Validator.isLength(data.password, { min: 5, max: 20 })) {
		errors.password = 'Your password must be between 5 and 20 characters';
	}

	if (Validator.isEmpty(data.password)) {
		errors.password = 'Password field is required';
	}

	if (!Validator.equals(data.password, data.password2)) {
		errors.password2 = 'Passwords must match';
	}

	return {
		errors,
		isValid : isEmpty(errors),
	};
};
