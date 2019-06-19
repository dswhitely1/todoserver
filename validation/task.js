const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateTaskInput(data) {
	let errors = {};

	data.username = !isEmpty(data.todo) ? data.todo : '';

	if (Validator.isEmpty(data.todo)) {
		errors.todo = 'A todo is required';
	}

	return {
		errors,
		isValid : isEmpty(errors),
	};
};
