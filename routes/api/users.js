const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const key = process.env.SECRET_KEY;
const passport = require('passport');

const TodoUser = require('../../models/User');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

router.get('/test', (req, res) => res.json({ msg: 'Users working' }));

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
module.exports = router;
