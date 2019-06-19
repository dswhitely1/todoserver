const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const validateTaskInput = require('../../validation/task');
const TodoUser = require('../../models/User');

router.post('/addtask', passport.authenticate('jwt', { session: false }), (req, res) => {
	const { errors, isValid } = validateTaskInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}
	Task.findOne({ user: req.user.id }).then(task => {
		const newTask = {
			user      : req.user.id,
			todo      : req.body.todo,
			date      : Date.now,
			completed : false,
		};
		task.unshift(newTask);
		task.save().then(task => res.json(task));
	});
});
