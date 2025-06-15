const Event = require("../models/event.js");
const User = require("../models/user.js");
const Signup = require("../models/signup.js");

let EventsController = {};

EventsController.showCreateEventPage = (req, res) => {
  res.render('create_event');
};

EventsController.createEvent = (req, res) => {
  const {name, date, location, description} = req.body;
  const hasCapacity = req.body.hasCapacity === 'on';
  const capacity = hasCapacity ? parseInt(req.body.capacity, 10) : undefined;
  const categories = JSON.parse(req.body.categories);

  //const dateTime = new Date(`${date}T${time}:00`);
  const dateTime = new Date(date);
  //console.log("Data creata: ", dateTime);

  const newEvent = new Event({
    name,
    dateTime,
    location,
    hasCapacity,
    capacity,
    description,
    categories
  });
  // console.log(newEvent);

  newEvent.save()
  .then((result) => {
    console.log("NEW EVENT salvato correttamente nel DB.");
    
    req.session.flash = { type: "success", message: "New event created successfully" };
    res.redirect('/events/created');
  })
  .catch((error) => {
    console.log("ERRORE nel salvare NEW EVENT");
    console.log(error);
    res.status(500).send("ERRORE nel salvare NEW EVENT");
  });
};

EventsController.showCreatedEventsPage = (req, res) => {
  res.render('created_events');
};

EventsController.showEventDetailsPage = async (req, res) => {
  try {
    const eventId = req.params.id;
    const username = req.session.username || null;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send("Evento non trovato");
    }

    if (username) {
    	// Controlla se l'utente è registrato o meno all'evento.
    	const user = await User.findOne({ username });

      if (user) {
      	const alreadySignedUp = await Signup.findOne({ user_id: user._id, event_id: eventId});

      	if (alreadySignedUp) {
      		res.locals.isSignedUp = true;
      	}
      }
    }

    // Recupera i partecipanti dell'evento.
    const signups = await Signup.find({ event_id: eventId }).populate("user_id", "username");
    const participants = signups.map(s => {
      return s.user_id.username;
    });

    event.nParts = participants.length;

    if (req.session.isOrganizer) {
      res.locals.participants = participants;
    }

    return res.render('event_detail', { event });
  }
  catch (error) {
    console.log("ERRORE nel leggere da USER / EVENT");
    console.log(error);
    return res.status(500).send("ERRORE nel leggere da USER / EVENT");
  }
};

// RESTful API
EventsController.getPastEventsJSON = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pastEvents = await Event.find({ dateTime: {$lt: today} }).sort({ dateTime: 1});

    res.json(pastEvents);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero degli eventi passati.' });
  }
};

EventsController.getTodayEventsJSON = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(now.getHours() + 2);

    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const todayEvents = await Event.find({ dateTime: {$gte: start, $lt: end} }).sort({ dateTime: 1});
    res.json(todayEvents);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero degli eventi del giorno.' });
  }
};

EventsController.getUpcomingEventsJSON = async (req, res) => {
  try {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const upcomingEvents = await Event.find({ dateTime: {$gte: now} }).sort({ dateTime: 1});
    res.json(upcomingEvents);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero degli eventi futuri.' });
  }
};

module.exports = EventsController;