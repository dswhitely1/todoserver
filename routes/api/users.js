const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = process.env.SECRET_KEY;
const passport = require('passport');

const TodoUser = require('../../models/User');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const validateTaskInput = require('../../validation/task');

router.get('/test', (req, res) => res.json({ msg: 'Users working' }));

router.get('/tasks', passport.authenticate('jwt', { session: false }), (req, res) => {
	TodoUser.findById({ _id: req.user.id }).then(user => res.json(user.tasks)).catch(err => console.log(err));
});

router.post('/register', (req, res) => {
	const { errors, isValid } = validateRegisterInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}

	TodoUser.findOne({ username: req.body.username }).then(user => {
		if (user) {
			errors.username = 'Username already exists';
			return res.status(400).json(errors);
		}
	});

	const newUser = new TodoUser({
		name     : req.body.name,
		username : req.body.username,
		password : req.body.password,
		tasks    : [],
	});

	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(newUser.password, salt, (err, hash) => {
			if (err) throw err;
			newUser.password = hash;
			newUser.save().then(user => res.json(user)).catch(err => console.log(err));
		});
	});
});

router.post('/login', (req, res) => {
	const { errors, isValid } = validateLoginInput(req.body);
	if (!isValid) {
		return res.status(400).json(errors);
	}
	const username = req.body.username;
	const password = req.body.password;
	TodoUser.findOne({ username }).then(user => {
		if (!user) {
			errors.username = 'User not found';
			return res.status(404).json(errors);
		}

		bcrypt.compare(password, user.password).then(isMatch => {
			if (isMatch) {
				const payload = {
					id       : user.id,
					name     : user.name,
					username : user.username,
				};
				jwt.sign(payload, key, { expiresIn: 3600 }, (err, token) => {
					res.json({
						sucess : true,
						token  : `Bearer ${token}`,
					});
				});
			} else {
				errors.password = 'Password incorrect';
				return res.status(400).json(errors);
			}
		});
	});
});

router.post('/add-task', passport.authenticate('jwt', { session: false }), (req, res) => {
	const { errors, isValid } = validateTaskInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}
	TodoUser.findOne({ _id: req.user.id }).then(user => {
		const newTask = {
			todo : req.body.todo,
		};
		user.tasks = [ ...user.tasks, newTask ];
		user.save().then(user => res.json(user));
	});
});

router.put('/update-task/:taskId', passport.authenticate('jwt', { session: false }), (req, res) => {
	const { errors, isValid } = validateTaskInput(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}
	let updatedUser = {};
	updatedUser = req.user;
	const updatedTasks = updatedUser.tasks.map(task => {
		if (task._id.toString() === req.params.taskId) {
			const updatedTask = {
				_id       : req.params.taskId,
				todo      : req.body.todo,
				date      : req.body.date,
				completed : req.body.completed,
			};
			return updatedTask;
		} else {
			return task;
		}
	});
	updatedUser.tasks = updatedTasks;
	TodoUser.findOneAndUpdate({ _id: req.user.id }, { $set: updatedUser }, { new: true }).then(user => res.json(user));
});

router.put('/delete-task/:taskId', passport.authenticate('jwt', { session: false }), (req, res) => {
	let updateUser = req.user;
	const updatedTasks = updateUser.tasks.filter(task => task._id.toString() !== req.params.taskId);
	updateUser.tasks = updatedTasks;
	TodoUser.findOneAndUpdate({ _id: req.user.id }, { $set: updateUser }, { new: true }).then(user => res.json(user));
});

router.put('/delete-completed', passport.authenticate('jwt', { session: false }), (req, res) => {
	let updateUser = req.user;
	const updateTasks = updateUser.tasks.filter(task => !task.completed);
	updateUser.tasks = updateTasks;
	TodoUser.findOneAndUpdate({ _id: req.user.id }, { $set: updateUser }, { new: true }).then(user => res.json(user));
});

module.exports = router;
