require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
// const cors = require('cors');

const users = require('./routes/api/users');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(cors());

const db = process.env.DATABASE;

mongoose
	.connect(db, { useNewUrlParser: true })
	.then(() => console.log(`Database connected`))
	.catch(err => console.log(err));

app.use(passport.initialize());
require('./config/passport')(passport);

app.use('/api/users', users);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`\n\n Server is listening on port ${PORT}\n\n`));
