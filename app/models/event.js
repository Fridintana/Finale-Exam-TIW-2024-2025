const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateTime: { type: Date, required: true },
  // time: { type: String, required: true },
  location: { type: String, required: true },
  hasCapacity: { type: Boolean, required: true, default: false },
  capacity: { type: Number, min: 1},  // validate?
  description: { type: String },
  categories: [ String ]
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;