const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const SignupSchema = new mongoose.Schema({
	user_id: { type: ObjectId, ref: "User", required: true },
	event_id: { type: ObjectId, ref: "Event", required: true },
	signup_date: { type: Date, default: Date.now() }
});

SignupSchema.index({ user_id: 1, event_id: 1}, { unique: true });

const Signup = mongoose.model("Signup", SignupSchema);

module.exports = Signup;