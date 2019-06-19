const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name     : {
		type     : String,
		required : true,
	},
	username : {
		type     : String,
		required : true,
	},
	password : {
		type     : String,
		required : true,
	},
	tasks    : [
		{
			todo      : {
				type     : String,
				required : true,
			},
			date      : {
				type    : Date,
				default : Date.now,
			},
			completed : {
				type    : Boolean,
				default : false,
			},
		},
	],
});

module.exports = User = mongoose.model('todousers', UserSchema);
