const Event = require("../models/event.js");
const User = require("../models/user.js");
const Signup = require("../models/signup.js");

let SignupsController = {};

SignupsController.showSubscribedEventsPage = (req, res) => {
  res.render('subscribed_events');
};

SignupsController.subscribe = async (req, res) => {
  const eventId = req.params.id;
  const username = req.session.username;

  const event = await Event.findById(eventId);
  const user = await User.findOne({ username });
  const userId = user._id;

  if (!event) {
    return res.status(404).send("Evento non trovato");
  }

  const now = new Date();
  now.setHours(now.getHours() + 2);
  //console.log("Subscribe - NOW: ", now);
  if (event.dateTime < now) {
    req.session.flash = { type: "neutral", message: "This event has already ended! Registration is no longer possible." };
  	return res.redirect(`/events/${eventId}`);
  }

  const alreadySignedUp = await Signup.findOne({ user_id: userId, event_id: eventId});
  if (alreadySignedUp) {
  	req.session.flash = { type: "neutral", message: "You are already registered for this event!" };
  	return res.redirect(`/events/${eventId}`);
  }

  if (event.hasCapacity) {
    const count = await Signup.countDocuments({ event_id: eventId });
    if (count === event.capacity) {
      req.session.flash = { type: "neutral", message: "This event is full!" };
      return res.redirect(`/events/${eventId}`);
    }
  }
  
  const newSignup = new Signup({
    "user_id": userId,
    "event_id": eventId
  });

  //console.log(newSignup);

  newSignup.save()
  .then ((result) => {
  	console.log("NEW SIGN UP salvato correttamente nel DB.");
  	req.session.flash = { type: "success", message: "Successful subscription" };
    res.redirect(`/events/${eventId}`);
  })
  .catch ((error) => {
  	console.log("ERRORE nel salvare NEW SIGN UP");
    console.log(error);
    res.status(500).send("ERRORE nel salvare NEW SIGN UP");
  });
};

SignupsController.unsubscribe = async (req, res) => {
	const eventId = req.params.id;
  const username = req.session.username;

  const event = await Event.findById(eventId);
  const user = await User.findOne({ username });

  if (!event) return res.status(404).send("Evento non trovato");

  const now = new Date();
  now.setHours(now.getHours() + 2);
  if (event.dateTime < now) {
  	req.session.flash = { type: "neutral", message: "This event has already ended! Unsubscribing is no longer possible." };
  	return res.redirect(`/events/${eventId}`);
  }

  if (!user) return res.status(404).send("Utente non trovato");
  const userId = user._id;

  await Signup.deleteOne({ user_id: userId, event_id: eventId});

  req.session.flash = { type: "success", message: "Successful unsubscription" };
  res.redirect(`/events/${eventId}`);
};

// RESTful API
SignupsController.getSignupsCount = async (req, res) => {
  try {
    const eventId = req.params.id;
    const count = await Signup.countDocuments({ event_id: eventId });
    res.json({ count });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dei signups.' });
  }
};

SignupsController.getSubscribedPastEventsJSON = async (req, res) => {
	try {
		const username = req.session.username;
		const user = await User.findOne({ username });

		if (!user) return res.status(404).send("Utente non trovato");

		const now = new Date();
		now.setHours(now.getHours() + 2);
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		const signups = await Signup.find({ user_id: user._id }).populate("event_id");
		const pastSubEvents = signups
								.filter(s => s.event_id.dateTime < today)
								.map(s => s.event_id);

		//console.log(pastSubEvents);

		res.json(pastSubEvents);
	}
	catch (error) {
		console.error(error);
    res.status(500).json({ error: "Errore nel recupero degli eventi passati a cui l'utente è iscritto."});
	}
};

SignupsController.getSubscribedTodayEventsJSON = async (req, res) => {
	try {
		const username = req.session.username;
		const user = await User.findOne({ username });

		if (!user) return res.status(404).send("Utente non trovato");

		const now = new Date();
		now.setHours(now.getHours() + 2);
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

		const signups = await Signup.find({ user_id: user._id }).populate("event_id");
		const todaySubEvents = signups
								.filter(s => (s.event_id.dateTime >= start && s.event_id.dateTime < end))
								.map(s => s.event_id);
		
		//console.log(todaySubEvents);

		res.json(todaySubEvents);
	}
	catch (error) {
		console.error(error);
    res.status(500).json({ error: "Errore nel recupero degli eventi del giorno a cui l'utente è iscritto."});
	}
};

SignupsController.getSubscribedUpcomingEventsJSON = async (req, res) => {
	try {
		const username = req.session.username;
		const user = await User.findOne({ username });

		if (!user) return res.status(404).send("Utente non trovato");

		const now = new Date();
		now.setHours(now.getHours() + 2);

		const signups = await Signup.find({ user_id: user._id }).populate("event_id");
		const upcomingSubEvents = signups
									.filter(s => s.event_id.dateTime >= now)
									.map(s => s.event_id);

		//console.log(upcomingSubEvents);

		res.json(upcomingSubEvents);
	}
	catch (error) {
		console.error(error);
    res.status(500).json({ error: "Errore nel recupero degli eventi passati a cui l'utente è iscritto."});
	}
};

module.exports = SignupsController;