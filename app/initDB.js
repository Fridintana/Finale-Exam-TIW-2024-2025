const mongoose = require("mongoose");
const User = require("./models/user.js");
const Event = require("./models/event.js");
const Signup = require("./models/signup.js");

const initDB = async () => {
	try {
		await mongoose.connect("mongodb://127.0.0.1:27017/eventdb");
		console.log("DB connected successfully");

		await Promise.all([
			User.init(),
			// Non ho indici sulla tabella Event
			// Event.init(),
			Signup.init()
		]);
		console.log("Indexes initialized successfully");
	}
	catch (err) {
		console.log("Connection to DB FAILED");
		console.log(err);
		process.exit(1);
	}
};

module.exports = initDB;